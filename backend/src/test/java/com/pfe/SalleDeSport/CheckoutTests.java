package com.pfe.SalleDeSport;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.SalleDeSport.Dto.SavePlan;
import com.pfe.SalleDeSport.Entity.*;
import com.pfe.SalleDeSport.Repository.*;
import com.pfe.SalleDeSport.Security.SessionTokens;
import com.pfe.SalleDeSport.Service.CheckoutService;
import com.pfe.SalleDeSport.Service.ClientService;
import com.pfe.SalleDeSport.Service.PackService;
import com.pfe.SalleDeSport.Service.PlanService;
import com.pfe.SalleDeSport.Service.StripeCheckout;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.sql.Date;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static com.pfe.SalleDeSport.Entity.CheckoutPurchase.Kind.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "FITCONNECT_STRIPE_WEBHOOK_SECRET=checkout-test-secret",
        "spring.datasource.url=jdbc:h2:mem:checkout-test;MODE=MySQL;DB_CLOSE_DELAY=-1"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CheckoutTests {
    private static final String URL = "https://checkout.stripe.com/test";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired SessionTokens tokens;
    @Autowired ClientRepository clients;
    @Autowired CoachRepository coaches;
    @Autowired PlanRepository plans;
    @Autowired PackRepository packs;
    @Autowired SalleDeSportRepository gyms;
    @Autowired CategoryRepository categories;
    @Autowired ReservationRepository reservations;
    @Autowired AbonnementRepository subscriptions;
    @Autowired CheckoutService checkout;
    @Autowired PlanService planService;
    @Autowired PackService packService;
    @Autowired ClientService clientService;
    @MockitoBean StripeCheckout stripe;

    @BeforeEach
    void mockStripeSessionCreation() {
        when(stripe.currency()).thenReturn("eur");
        when(stripe.create(anyString(), anyString(), anyLong(), eq("eur"), any(Instant.class)))
                .thenAnswer(call -> new StripeCheckout.Session("cs_" + call.getArgument(0), URL, "payment",
                        "open", "eur", call.getArgument(0), call.getArgument(2), "unpaid"));
    }

    @Test
    void onlyVerifiedPaymentFulfillsTheOwnersReservationOnce() throws Exception {
        Client buyer = client();
        Plan plan = plan(LocalDate.now().plusDays(2));
        for (String path : new String[]{"/reservation", "/abonnement", "/abonnement/renouveler"}) {
            mvc.perform(post(path).header("Authorization", bearer(buyer)).contentType("application/json").content("{}"))
                    .andExpect(status().isForbidden());
        }
        var opened = mvc.perform(post("/checkout").header("Authorization", bearer(buyer)).contentType("application/json")
                        .content(json.writeValueAsBytes(Map.of("kind", "SESSION", "productId", plan.getId(), "amount", 1))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.amount").value(37.50))
                .andExpect(jsonPath("$.currency").value("eur")).andExpect(jsonPath("$.state").value("OPEN"));
        String id = json.readTree(opened.andReturn().getResponse().getContentAsByteArray()).get("id").asText();
        assertThat(checkout.start(buyer.getId(), SESSION, plan.getId(), null).getId()).isEqualTo(id);
        String confirm = "/checkout/" + id + "/confirm";
        mvc.perform(post(confirm).header("Authorization", bearer(client()))).andExpect(status().isNotFound());
        when(stripe.retrieve("cs_" + id)).thenReturn(session(id, 3750, "complete", "unpaid"));
        mvc.perform(post(confirm).header("Authorization", bearer(buyer)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.state").value("OPEN"));
        when(stripe.retrieve("cs_" + id)).thenReturn(session(id, 1000, "complete", "paid"));
        mvc.perform(post(confirm).header("Authorization", bearer(buyer))).andExpect(status().isBadGateway());
        var paid = session(id, 3750, "complete", "paid");
        deliver(paid, "checkout.session.completed", false).andExpect(status().isBadRequest());
        assertThat(reservations.countByPlanId(plan.getId())).isZero();

        when(stripe.retrieve("cs_" + id)).thenReturn(paid);
        mvc.perform(post(confirm).header("Authorization", bearer(buyer)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.state").value("COMPLETED"))
                .andExpect(jsonPath("$.resultId").isNumber());
        deliver(paid, "checkout.session.completed", true).andExpect(status().isNoContent());
        deliver(paid, "checkout.session.completed", true).andExpect(status().isNoContent());
        assertThat(reservations.countByPlanIdAndClientId(plan.getId(), buyer.getId())).isOne();
    }

    @Test
    void heldCapacityReleasesOnStripeExpiryAndCancellation() throws Exception {
        Plan plan = plan(LocalDate.now().plusDays(2));
        Client buyer = client();
        String cancelled = checkout.start(buyer.getId(), SESSION, plan.getId(), null).getId();
        String expired = checkout.start(client().getId(), SESSION, plan.getId(), null).getId();
        checkout.start(client().getId(), SESSION, plan.getId(), null);
        Client nextBuyer = client();
        assertConflict(() -> checkout.start(nextBuyer.getId(), SESSION, plan.getId(), null));
        assertConflict(() -> planService.deletePlanning(plan.getId()));
        SavePlan rescheduled = new SavePlan();
        rescheduled.setDate(Date.valueOf(LocalDate.now().plusDays(3)));
        assertConflict(() -> planService.updatePlanning(plan.getId(), rescheduled));
        assertConflict(() -> clientService.supprimerClient(buyer.getId()));

        deliver(session(expired, 3750, "expired", "unpaid"), "checkout.session.expired", true)
                .andExpect(status().isNoContent());
        checkout.start(nextBuyer.getId(), SESSION, plan.getId(), null);
        when(stripe.expire("cs_" + cancelled)).thenReturn(session(cancelled, 3750, "expired", "unpaid"));
        mvc.perform(post("/checkout/" + cancelled + "/cancel").header("Authorization", bearer(buyer)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.state").value("EXPIRED"));
        checkout.start(client().getId(), SESSION, plan.getId(), null);
        assertThat(reservations.countByPlanId(plan.getId())).isZero();
    }

    @Test
    void paidPackUsesTheRequestedDateAndRenewalExtendsTheLatestTerm() throws Exception {
        Client buyer = client();
        Pack pack = pack();
        LocalDate activation = LocalDate.now().plusDays(2);
        assertConflict(() -> checkout.start(buyer.getId(), RENEWAL, pack.getId(), null));
        String purchase = checkout.start(buyer.getId(), PACK, pack.getId(), activation).getId();
        assertConflict(() -> packService.supprimerPack(pack.getId()));
        assertThat(subscriptions.findByClientId(buyer.getId())).isEmpty();
        deliver(session(purchase, 3750, "complete", "paid"), "checkout.session.completed", true)
                .andExpect(status().isNoContent());

        String renewal = checkout.start(buyer.getId(), RENEWAL, pack.getId(), null).getId();
        deliver(session(renewal, 3750, "complete", "paid"), "checkout.session.completed", true)
                .andExpect(status().isNoContent());
        assertThat(subscriptions.findByClientId(buyer.getId())).hasSize(2)
                .extracting(term -> new Date(term.getDateActivation().getTime()).toLocalDate())
                .containsExactlyInAnyOrder(activation, activation.plusDays(30));

        String gymSession = "Bearer " + tokens.issue("salle", pack.getSalle().getId(), null, "Test");
        mvc.perform(get("/salleDeSport/my-clients").header("Authorization", gymSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].clientId").value(buyer.getId()))
                .andExpect(jsonPath("$[0].dateActivation").isString())
                .andExpect(jsonPath("$[0].etat").value("en_attente"));
        String otherGymSession = "Bearer " + tokens.issue("salle", pack().getSalle().getId(), null, "Other");
        mvc.perform(get("/salleDeSport/my-clients").header("Authorization", otherGymSession))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void returningFromStripeDoesNotDuplicateATermFulfilledDuringVerification() throws Exception {
        Client buyer = client();
        Pack pack = pack();
        String id = checkout.start(buyer.getId(), PACK, pack.getId(), LocalDate.now().plusDays(1)).getId();
        var paid = session(id, 3750, "complete", "paid");
        when(stripe.retrieve("cs_" + id)).thenAnswer(call -> {
            CompletableFuture.runAsync(() -> checkout.accept(paid, Instant.now())).get(10, TimeUnit.SECONDS);
            return paid;
        });
        mvc.perform(post("/checkout/" + id + "/confirm").header("Authorization", bearer(buyer)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.state").value("COMPLETED"));
        assertThat(subscriptions.findByClientId(buyer.getId())).hasSize(1);
    }

    @Test
    void sessionsThatHaveStartedCannotBePurchased() {
        var plan = plan(LocalDate.now().minusDays(1));
        var client = client();
        assertConflict(() -> checkout.start(client.getId(), SESSION, plan.getId(), null));
    }

    private void assertConflict(Runnable action) {
        assertThatThrownBy(action::run).isInstanceOfSatisfying(ResponseStatusException.class,
                error -> assertThat(error.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
    }

    private ResultActions deliver(StripeCheckout.Session session, String type, boolean valid) throws Exception {
        long timestamp = Instant.now().getEpochSecond();
        String payload = json.writeValueAsString(Map.of("type", type, "created", timestamp, "data", Map.of("object", session)));
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec("checkout-test-secret".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String signature = HexFormat.of().formatHex(mac.doFinal((timestamp + "." + payload).getBytes(StandardCharsets.UTF_8)));
        return mvc.perform(post("/checkout/stripe/webhook").contentType("application/json")
                .content(payload.getBytes(StandardCharsets.UTF_8))
                .header("Stripe-Signature", "t=" + timestamp + ",v1=" + (valid ? signature : "00")));
    }

    private StripeCheckout.Session session(String id, long amount, String status, String paymentStatus) {
        return new StripeCheckout.Session("cs_" + id, null, "payment", status, "eur", id, amount, paymentStatus);
    }

    private String bearer(Client client) {
        return "Bearer " + tokens.issue("client", client.getId(), "Test", "Client");
    }

    private Client client() {
        Client client = new Client();
        client.setEmail(UUID.randomUUID() + "@example.test");
        client.setEtat(true);
        return clients.save(client);
    }

    private Plan plan(LocalDate date) {
        Coach coach = new Coach();
        coach.setEmail(UUID.randomUUID() + "@example.test");
        coach.setEtat(true);
        Plan plan = new Plan();
        plan.setCoach(coaches.save(coach));
        plan.setDate(Date.valueOf(date));
        plan.setDebut("13:30");
        plan.setPrix(37.50f);
        return plans.save(plan);
    }

    private Pack pack() {
        SalleDeSport gym = new SalleDeSport();
        gym.setEmail(UUID.randomUUID() + "@example.test");
        gym.setEtat(true);
        Category category = new Category();
        category.setNom("Fitness");
        Pack pack = new Pack();
        pack.setNom("Monthly gym pass");
        pack.setPrix(37.50f);
        pack.setSalle(gyms.save(gym));
        pack.setCategory(categories.save(category));
        return packs.save(pack);
    }
}
