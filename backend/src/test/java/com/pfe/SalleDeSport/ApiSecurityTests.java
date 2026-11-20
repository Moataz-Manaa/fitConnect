package com.pfe.SalleDeSport;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.SalleDeSport.Entity.Admin;
import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Entity.Coach;
import com.pfe.SalleDeSport.Entity.ConfirmationToken;
import com.pfe.SalleDeSport.Entity.Plan;
import com.pfe.SalleDeSport.Entity.Reservation;
import com.pfe.SalleDeSport.Entity.SalleDeSport;
import com.pfe.SalleDeSport.Repository.AdminRepository;
import com.pfe.SalleDeSport.Repository.ClientRepository;
import com.pfe.SalleDeSport.Repository.CoachRepository;
import com.pfe.SalleDeSport.Repository.ConfirmationTokenRepository;
import com.pfe.SalleDeSport.Repository.PasswordResetTokenRepository;
import com.pfe.SalleDeSport.Repository.PlanRepository;
import com.pfe.SalleDeSport.Repository.ReservationRepository;
import com.pfe.SalleDeSport.Repository.SalleDeSportRepository;
import com.pfe.SalleDeSport.Security.SessionTokens;
import com.pfe.SalleDeSport.Service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {"FITCONNECT_ZEGO_APP_ID=12345", "FITCONNECT_ZEGO_SERVER_SECRET=" + ApiSecurityTests.TEST_VIDEO_KEY})
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ApiSecurityTests {
    static final String TEST_VIDEO_KEY = "12345678901234567890123456789012";
    private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder();

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired SessionTokens sessions;
    @Autowired JwtEncoder encoder;
    @Autowired ClientRepository clients;
    @Autowired CoachRepository coaches;
    @Autowired AdminRepository admins;
    @Autowired PlanRepository plans;
    @Autowired ReservationRepository reservations;
    @Autowired SalleDeSportRepository gyms;
    @Autowired PasswordResetTokenRepository resets;
    @Autowired ConfirmationTokenRepository confirmations;
    @MockitoBean EmailService email;

    @Test
    void adminOverviewReturnsOnlyAccountCounts() throws Exception {
        Admin admin = admin("Sous Administrateur");
        Client client = client("overview-client@example.test", true);
        Coach activeCoach = coach("overview-active@example.test");
        Coach inactiveCoach = coach("overview-inactive@example.test");
        inactiveCoach.setEtat(false);
        SalleDeSport gym = new SalleDeSport();
        gym.setEmail("overview-gym@example.test");
        gym.setEtat(true);
        gyms.save(gym);

        mvc.perform(get("/admin/overview")).andExpect(status().isUnauthorized());
        mvc.perform(get("/admin/overview").header("Authorization", bearer("client", client.getId())))
                .andExpect(status().isForbidden());
        mvc.perform(get("/admin/overview").header("Authorization", bearer("coach", activeCoach.getId())))
                .andExpect(status().isForbidden());
        mvc.perform(get("/admin/overview").header("Authorization", bearer("admin", admin.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.admins").value(1))
                .andExpect(jsonPath("$.clients").value(1))
                .andExpect(jsonPath("$.coaches.active").value(1))
                .andExpect(jsonPath("$.coaches.inactive").value(1))
                .andExpect(jsonPath("$.gyms.active").value(1))
                .andExpect(jsonPath("$.gyms.inactive").value(0));
    }

    @Test
    void onlyAccountOwnerAndAdminsCanReadClientProfile() throws Exception {
        Client owner = client("owner@example.test", true);
        Client other = client("other@example.test", true);
        Coach coach = coach("coach@example.test");
        Admin admin = admin("Sous Administrateur");
        String path = "/client/" + owner.getId();

        mvc.perform(get("/category")).andExpect(status().isOk());
        mvc.perform(get(path)).andExpect(status().isUnauthorized());
        mvc.perform(get(path).header("Authorization", bearer("coach", coach.getId())))
                .andExpect(status().isForbidden());
        mvc.perform(get(path).header("Authorization", bearer("client", other.getId())))
                .andExpect(status().isForbidden());
        mvc.perform(get(path).header("Authorization", bearer("client", owner.getId())))
                .andExpect(status().isOk()).andExpect(jsonPath("$.email").value(owner.getEmail()))
                .andExpect(jsonPath("$.mp").doesNotExist());
        mvc.perform(get(path).header("Authorization", bearer("admin", admin.getId())))
                .andExpect(status().isOk()).andExpect(jsonPath("$.mp").doesNotExist());
    }

    @Test
    void rejectsMalformedExpiredAndInactiveSessions() throws Exception {
        Client active = client("active@example.test", true);
        Client inactive = client("inactive@example.test", false);
        String path = "/client/" + active.getId();
        Instant now = Instant.now();
        var claims = JwtClaimsSet.builder().issuer("fitconnect").subject(active.getId().toString())
                .issuedAt(now.minusSeconds(600)).expiresAt(now.minusSeconds(300)).claim("role", "client").build();
        String expired = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
        mvc.perform(get(path).header("Authorization", "Bearer malformed"))
                .andExpect(status().isUnauthorized());
        mvc.perform(get(path).header("Authorization", "Bearer " + expired))
                .andExpect(status().isUnauthorized());
        mvc.perform(get("/client/" + inactive.getId()).header("Authorization", bearer("client", inactive.getId())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void clientProfileCannotChangeVerifiedEmailOrAccountState() throws Exception {
        Client owner = client("owner@example.test", true);
        mvc.perform(put("/client/edit/{id}", owner.getId())
                        .header("Authorization", bearer("client", owner.getId()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("nom", "Updated", "email", "wrong@example.test", "etat", false))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.nom").value("Updated"))
                .andExpect(jsonPath("$.email").value("owner@example.test"))
                .andExpect(jsonPath("$.etat").value(true));
    }

    @Test
    void onlySuperAdminsCanManageOtherAdmins() throws Exception {
        Admin superAdmin = admin("Super Administrateur");
        Admin subordinate = admin("Sous Administrateur");
        String update = json.writeValueAsString(Map.of("nom", "Updated", "prenom", "Admin",
                "email", subordinate.getEmail(), "role", "Sous Administrateur"));
        mvc.perform(put("/admin/{id}", subordinate.getId()).header("Authorization", bearer("admin", subordinate.getId()))
                        .contentType(MediaType.APPLICATION_JSON).content(update))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/admin/{id}", superAdmin.getId()).header("Authorization", bearer("admin", subordinate.getId())))
                .andExpect(status().isForbidden());
        mvc.perform(put("/admin/{id}", subordinate.getId()).header("Authorization", bearer("admin", superAdmin.getId()))
                        .contentType(MediaType.APPLICATION_JSON).content(update))
                .andExpect(status().isOk()).andExpect(jsonPath("$.nom").value("Updated"))
                .andExpect(jsonPath("$.mp").doesNotExist());
    }

    @Test
    void resetRequestsRotateTheTokenAndAResetConsumesIt() throws Exception {
        Client account = client("reset@example.test", true);
        String response = mvc.perform(post("/client/forgot-password").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("email", account.getEmail()))))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String firstToken = resets.findByClientId(account.getId()).getToken();
        mvc.perform(post("/client/forgot-password").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("email", account.getEmail()))))
                .andExpect(status().isOk()).andExpect(content().string(response));
        mvc.perform(post("/client/forgot-password").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"unknown@example.test\"}"))
                .andExpect(status().isOk()).andExpect(content().string(response));
        String currentToken = resets.findByClientId(account.getId()).getToken();
        assertThat(currentToken).isNotEqualTo(firstToken);
        reset(firstToken, 400);
        reset(currentToken, 200);
        reset(currentToken, 400);
        assertThat(passwords.matches("new-password-for-test", account.getMp())).isTrue();
    }

    @Test
    void emailConfirmationActivatesItsAccountAndConsumesTheLink() throws Exception {
        Client account = client("pending@example.test", false);
        String token = confirmations.save(new ConfirmationToken(account)).getConfirmationToken();
        mvc.perform(get("/client/confirm-account").param("token", token)).andExpect(status().isOk());
        assertThat(clients.findById(account.getId()).orElseThrow().isEtat()).isTrue();
        mvc.perform(get("/client/confirm-account").param("token", token)).andExpect(status().isBadRequest());
    }

    @Test
    void onlyBookedClientsAndTheAssignedCoachReceiveRoomScopedVideoTokens() throws Exception {
        Client booked = client("booked@example.test", true);
        Client unbooked = client("unbooked@example.test", true);
        Coach coach = coach("owner@example.test");
        Coach otherCoach = coach("other@example.test");
        Plan plan = new Plan();
        plan.setCoach(coach);
        plans.save(plan);
        Reservation reservation = new Reservation();
        reservation.setClient(booked);
        reservation.setPlan(plan);
        reservations.save(reservation);
        mvc.perform(get("/coach/{id}/clients", coach.getId()).header("Authorization", bearer("coach", otherCoach.getId())))
                .andExpect(status().isForbidden());
        mvc.perform(get("/coach/{id}/clients", coach.getId()).header("Authorization", bearer("coach", coach.getId())))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].email").value(booked.getEmail()))
                .andExpect(jsonPath("$[0].mp").doesNotExist());

        String roomId = "planning_" + plan.getId() + "_room";
        String path = "/video/rooms/" + plan.getId() + "/token";

        mvc.perform(post(path)).andExpect(status().isUnauthorized());
        mvc.perform(post(path).header("Authorization", bearer("client", unbooked.getId())))
                .andExpect(status().isForbidden());
        mvc.perform(post(path).header("Authorization", bearer("coach", otherCoach.getId())))
                .andExpect(status().isForbidden());
        mvc.perform(post(path).header("Authorization", bearer("coach", coach.getId())))
                .andExpect(status().isOk()).andExpect(jsonPath("$.roomId").value(roomId));
        var response = mvc.perform(post(path).header("Authorization", bearer("client", booked.getId())))
                .andExpect(status().isOk()).andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(jsonPath("$.roomId").value(roomId)).andReturn().getResponse();

        var result = json.readTree(response.getContentAsByteArray());
        String token = result.get("token").asText();
        assertThat(token).startsWith("04");
        ByteBuffer envelope = ByteBuffer.wrap(Base64.getDecoder().decode(token.substring(2)));
        long expiry = envelope.getLong();
        byte[] iv = new byte[envelope.getShort()];
        envelope.get(iv);
        byte[] ciphertext = new byte[envelope.getShort()];
        envelope.get(ciphertext);
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(TEST_VIDEO_KEY.getBytes(StandardCharsets.UTF_8), "AES"),
                new IvParameterSpec(iv));
        var claims = json.readTree(cipher.doFinal(ciphertext));
        var payload = json.readTree(claims.get("payload").asText());
        assertThat(claims.get("app_id").asLong()).isEqualTo(result.get("appId").asLong());
        assertThat(claims.get("user_id").asText()).isEqualTo(result.get("userId").asText());
        assertThat(claims.get("expire").asLong()).isEqualTo(expiry);
        assertThat(expiry - claims.get("ctime").asLong()).isEqualTo(300);
        assertThat(payload.get("room_id").asText()).isEqualTo(roomId);
        assertThat(payload.at("/privilege/1").asInt()).isEqualTo(1);
        assertThat(payload.at("/privilege/2").asInt()).isEqualTo(1);
    }

    private void reset(String token, int expectedStatus) throws Exception {
        mvc.perform(post("/client/reset-password").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("token", token, "newPassword", "new-password-for-test"))))
                .andExpect(status().is(expectedStatus));
    }

    private String bearer(String role, Long id) {
        return "Bearer " + sessions.issue(role, id, "Test", "Account");
    }

    private Client client(String email, boolean active) {
        Client account = new Client();
        account.setEmail(email);
        account.setEtat(active);
        account.setMp(passwords.encode("password-for-test"));
        return clients.save(account);
    }

    private Coach coach(String email) {
        Coach account = new Coach();
        account.setEmail(email);
        account.setEtat(true);
        return coaches.save(account);
    }

    private Admin admin(String role) {
        Admin account = new Admin();
        account.setEmail(role.startsWith("Super") ? "super@example.test" : "sub@example.test");
        account.setRole(role);
        return admins.save(account);
    }
}
