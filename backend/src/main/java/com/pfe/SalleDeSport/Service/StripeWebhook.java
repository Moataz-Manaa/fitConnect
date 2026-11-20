package com.pfe.SalleDeSport.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.Optional;
import java.util.Set;

@Component
public class StripeWebhook {
    private static final long TOLERANCE_SECONDS = 300;
    private static final Set<String> EVENTS = Set.of("checkout.session.completed", "checkout.session.expired");
    private final String secret;
    private final ObjectMapper json;

    public StripeWebhook(@Value("${FITCONNECT_STRIPE_WEBHOOK_SECRET:}") String secret, ObjectMapper json) {
        this.secret = secret;
        this.json = json;
    }

    public Optional<Event> verify(byte[] payload, String header) {
        if (secret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Stripe webhooks are not configured");
        }
        if (header == null) {
            throw badSignature();
        }
        String[] parts = header.split(",");
        long timestamp = Arrays.stream(parts).map(String::strip).filter(part -> part.startsWith("t="))
                .map(part -> timestamp(part.substring(2))).findFirst().orElseThrow(this::badSignature);
        long now = Instant.now().getEpochSecond();
        if (timestamp < now - TOLERANCE_SECONDS || timestamp > now + TOLERANCE_SECONDS) {
            throw badSignature();
        }
        byte[] expected = signature(timestamp, payload);
        boolean matches = Arrays.stream(parts).map(String::strip).filter(part -> part.startsWith("v1="))
                .anyMatch(part -> matchesSignature(expected, part.substring(3)));
        if (!matches) {
            throw badSignature();
        }

        try {
            var event = json.readTree(payload);
            if (!EVENTS.contains(event.path("type").asText())) {
                return Optional.empty();
            }
            var session = json.treeToValue(event.path("data").path("object"), StripeCheckout.Session.class);
            long created = event.path("created").asLong(0);
            if (session == null || session.id() == null || created <= 0 || created > now + TOLERANCE_SECONDS) {
                throw badSignature();
            }
            return Optional.of(new Event(session, Instant.ofEpochSecond(created)));
        } catch (IOException failure) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Stripe event");
        }
    }

    private long timestamp(String value) {
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ignored) {
            throw badSignature();
        }
    }

    private byte[] signature(long timestamp, byte[] payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            mac.update((timestamp + ".").getBytes(StandardCharsets.US_ASCII));
            return mac.doFinal(payload);
        } catch (GeneralSecurityException failure) {
            throw new IllegalStateException("Could not verify Stripe signature", failure);
        }
    }

    private boolean matchesSignature(byte[] expected, String hex) {
        try {
            return hex.length() == expected.length * 2 && MessageDigest.isEqual(expected, HexFormat.of().parseHex(hex));
        } catch (IllegalArgumentException ignored) {
            return false;
        }
    }

    private ResponseStatusException badSignature() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Stripe webhook signature");
    }

    public record Event(StripeCheckout.Session session, Instant createdAt) { }
}
