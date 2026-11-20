package com.pfe.SalleDeSport.Service;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import java.net.http.HttpClient;
import java.time.Duration;
import java.time.Instant;
import java.util.Currency;
import java.util.Locale;

@Component
public class StripeCheckout {
    private final RestClient http;
    private final String secretKey;
    private final String webhookSecret;
    private final String currency;
    private final String frontendBaseUrl;

    public StripeCheckout(@Value("${FITCONNECT_STRIPE_SECRET_KEY:}") String secretKey,
                          @Value("${FITCONNECT_STRIPE_WEBHOOK_SECRET:}") String webhookSecret,
                          @Value("${FITCONNECT_CHECKOUT_CURRENCY:}") String currency,
                          @Value("${fitconnect.urls.frontend-base-url}") String frontendBaseUrl) {
        var factory = new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build());
        factory.setReadTimeout(Duration.ofSeconds(10));
        this.http = RestClient.builder().baseUrl("https://api.stripe.com/v1").requestFactory(factory).build();
        this.secretKey = secretKey;
        this.webhookSecret = webhookSecret;
        this.currency = currency.strip().toLowerCase(Locale.ROOT);
        this.frontendBaseUrl = frontendBaseUrl;
    }

    public String currency() {
        requireConfigured();
        try {
            if (Currency.getInstance(currency.toUpperCase(Locale.ROOT)).getDefaultFractionDigits() == 2) {
                return currency;
            }
        } catch (IllegalArgumentException ignored) {
            // The merchant must configure a valid currency before accepting payments.
        }
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Checkout currency is unavailable");
    }

    public Session create(String reference, String description, long amount, String currency, Instant expiresAt) {
        requireConfigured();
        String returnUrl = frontendBaseUrl + "/checkout/" + reference;
        var form = new LinkedMultiValueMap<String, String>();
        form.add("mode", "payment");
        form.add("adaptive_pricing[enabled]", "false");
        form.add("payment_method_types[]", "card");
        form.add("success_url", returnUrl + "?returned=true");
        form.add("cancel_url", returnUrl + "?cancelled=true");
        form.add("client_reference_id", reference);
        form.add("expires_at", Long.toString(expiresAt.getEpochSecond()));
        form.add("line_items[0][quantity]", "1");
        form.add("line_items[0][price_data][currency]", currency);
        form.add("line_items[0][price_data][unit_amount]", Long.toString(amount));
        form.add("line_items[0][price_data][product_data][name]", description);
        try {
            return required(http.post().uri("/checkout/sessions")
                    .headers(headers -> headers.setBearerAuth(secretKey))
                    .header("Idempotency-Key", reference)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED).body(form)
                    .retrieve().body(Session.class));
        } catch (RestClientException failure) {
            throw unavailable();
        }
    }

    public Session retrieve(String id) {
        requireConfigured();
        try {
            return required(http.get().uri("/checkout/sessions/{id}", id)
                    .headers(headers -> headers.setBearerAuth(secretKey)).retrieve().body(Session.class));
        } catch (RestClientException failure) {
            throw unavailable();
        }
    }

    public Session expire(String id) {
        requireConfigured();
        try {
            return required(http.post().uri("/checkout/sessions/{id}/expire", id)
                    .headers(headers -> headers.setBearerAuth(secretKey)).retrieve().body(Session.class));
        } catch (RestClientException failure) {
            // A payment might have completed while expiry was requested.
            Session current = retrieve(id);
            if (!"open".equals(current.status())) {
                return current;
            }
            throw unavailable();
        }
    }

    private void requireConfigured() {
        if (secretKey.isBlank() || webhookSecret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Checkout is not configured");
        }
    }

    private Session required(Session session) {
        if (session == null || session.id() == null || session.id().isBlank()) {
            throw unavailable();
        }
        return session;
    }

    private ResponseStatusException unavailable() {
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not verify the Stripe Checkout session");
    }

    public record Session(String id, String url, String mode, String status, String currency,
                          @JsonProperty("client_reference_id") String reference,
                          @JsonProperty("amount_total") Long amount,
                          @JsonProperty("payment_status") String paymentStatus) { }
}
