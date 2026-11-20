package com.pfe.SalleDeSport.RestController;

import com.pfe.SalleDeSport.Entity.CheckoutPurchase;
import com.pfe.SalleDeSport.Entity.CheckoutPurchase.Kind;
import com.pfe.SalleDeSport.Entity.CheckoutPurchase.State;
import com.pfe.SalleDeSport.Service.CheckoutService;
import com.pfe.SalleDeSport.Service.StripeCheckout;
import com.pfe.SalleDeSport.Service.StripeWebhook;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/checkout")
public class CheckoutRestController {
    private final CheckoutService checkout;
    private final StripeCheckout stripe;
    private final StripeWebhook webhook;

    public CheckoutRestController(CheckoutService checkout, StripeCheckout stripe, StripeWebhook webhook) {
        this.checkout = checkout;
        this.stripe = stripe;
        this.webhook = webhook;
    }

    @PostMapping
    public ResponseEntity<CheckoutView> start(@AuthenticationPrincipal Jwt jwt, @RequestBody CheckoutRequest request) {
        return response(checkout.start(Long.valueOf(jwt.getSubject()), request.kind(), request.productId(), request.activationDate()));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<CheckoutView> confirm(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        Long clientId = Long.valueOf(jwt.getSubject());
        CheckoutPurchase purchase = checkout.findOwned(id.toString(), clientId);
        if (purchase.getState() == State.OPEN) {
            checkout.accept(stripe.retrieve(purchase.getProviderSessionId()), Instant.now());
            purchase = checkout.findOwned(id.toString(), clientId);
        }
        return response(purchase);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<CheckoutView> cancel(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        Long clientId = Long.valueOf(jwt.getSubject());
        CheckoutPurchase purchase = checkout.findOwned(id.toString(), clientId);
        if (purchase.getState() == State.OPEN) {
            checkout.accept(stripe.expire(purchase.getProviderSessionId()), Instant.now());
            purchase = checkout.findOwned(id.toString(), clientId);
        }
        return response(purchase);
    }

    @PostMapping("/stripe/webhook")
    public ResponseEntity<Void> receiveWebhook(@RequestBody byte[] payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String signature) {
        webhook.verify(payload, signature).ifPresent(event -> checkout.accept(event.session(), event.createdAt()));
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<CheckoutView> response(CheckoutPurchase purchase) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(new CheckoutView(
                purchase.getId(), purchase.getKind(), purchase.getState(), purchase.getDescription(),
                BigDecimal.valueOf(purchase.getUnitAmount(), 2), purchase.getCurrency(), purchase.getActivationDate(),
                purchase.getProviderUrl(), purchase.getResultId(), purchase.getConfirmedAt()));
    }

    public record CheckoutRequest(Kind kind, Long productId, LocalDate activationDate) { }

    public record CheckoutView(String id, Kind kind, State state, String description, BigDecimal amount, String currency,
                               LocalDate activationDate, String checkoutUrl, Long resultId, Instant confirmedAt) { }
}
