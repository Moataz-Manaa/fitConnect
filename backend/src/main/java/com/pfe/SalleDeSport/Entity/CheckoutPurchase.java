package com.pfe.SalleDeSport.Entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "checkout_purchase", indexes = {
        @Index(name = "checkout_product_state", columnList = "kind,product_id,state"),
        @Index(name = "checkout_client_state", columnList = "client_id,state")
})
@Getter
public class CheckoutPurchase {
    public enum Kind { SESSION, PACK, RENEWAL }
    public enum State { OPEN, COMPLETED, EXPIRED }

    @Id
    @Column(length = 36)
    private String id;
    @Column(name = "client_id", nullable = false)
    private Long clientId;
    @Column(name = "product_id", nullable = false)
    private Long productId;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Kind kind;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private State state;
    @Column(nullable = false, length = 255)
    private String description;
    @Column(name = "unit_amount", nullable = false)
    private long unitAmount;
    @Column(nullable = false, length = 3)
    private String currency;
    @Column(name = "activation_date")
    private LocalDate activationDate;
    @Column(name = "provider_session_id", nullable = false, unique = true)
    private String providerSessionId;
    @Column(name = "provider_url", length = 2048)
    private String providerUrl;
    @Column(name = "result_id")
    private Long resultId;
    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    protected CheckoutPurchase() {}

    public CheckoutPurchase(Long clientId, Long productId, Kind kind, String description, long unitAmount,
                            String currency, LocalDate activationDate) {
        this.id = UUID.randomUUID().toString();
        this.clientId = clientId;
        this.productId = productId;
        this.kind = kind;
        this.description = description;
        this.unitAmount = unitAmount;
        this.currency = currency;
        this.activationDate = activationDate;
        this.state = State.OPEN;
    }

    public void attachSession(String sessionId, String url) {
        this.providerSessionId = sessionId;
        this.providerUrl = url;
    }

    public void expire() {
        state = State.EXPIRED;
        providerUrl = null;
    }

    public void complete(long resultId, LocalDate activationDate, Instant confirmedAt) {
        this.resultId = resultId;
        this.activationDate = activationDate;
        this.confirmedAt = confirmedAt;
        this.providerUrl = null;
        this.state = State.COMPLETED;
    }
}
