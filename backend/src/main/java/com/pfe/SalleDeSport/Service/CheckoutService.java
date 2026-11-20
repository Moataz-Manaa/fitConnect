package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.CheckoutPurchase;
import com.pfe.SalleDeSport.Entity.CheckoutPurchase.Kind;
import com.pfe.SalleDeSport.Entity.CheckoutPurchase.State;
import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Entity.Plan;
import com.pfe.SalleDeSport.Repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.util.Objects;

@Service
public class CheckoutService {
    private static final Duration CHECKOUT_DURATION = Duration.ofMinutes(45);
    private static final DateTimeFormatter SESSION_TIME = DateTimeFormatter.ofPattern("H:mm[:ss]").withResolverStyle(ResolverStyle.STRICT);

    private final CheckoutPurchaseRepository purchases;
    private final ClientRepository clients;
    private final PlanRepository plans;
    private final PackRepository packs;
    private final ReservationRepository reservations;
    private final AbonnementRepository subscriptions;
    private final ReservationService reservationService;
    private final AbonnementService abonnementService;
    private final StripeCheckout stripe;
    @PersistenceContext
    private EntityManager entityManager;

    public CheckoutService(CheckoutPurchaseRepository purchases, ClientRepository clients, PlanRepository plans,
                           PackRepository packs, ReservationRepository reservations, AbonnementRepository subscriptions,
                           ReservationService reservationService, AbonnementService abonnementService, StripeCheckout stripe) {
        this.purchases = purchases;
        this.clients = clients;
        this.plans = plans;
        this.packs = packs;
        this.reservations = reservations;
        this.subscriptions = subscriptions;
        this.reservationService = reservationService;
        this.abonnementService = abonnementService;
        this.stripe = stripe;
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public CheckoutPurchase start(Long clientId, Kind kind, Long productId, LocalDate activationDate) {
        if (kind == null || productId == null || productId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Checkout requires a valid product");
        }
        String currency = stripe.currency();
        if (!lockClient(clientId).isEtat()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        var existing = purchases.findByClientIdAndProductIdAndKindAndState(clientId, productId, kind, State.OPEN);
        if (existing.isPresent()) {
            return existing.get();
        }

        Instant now = Instant.now();
        Instant expiresAt = now.plus(CHECKOUT_DURATION);
        CheckoutPurchase purchase = switch (kind) {
            case SESSION -> {
                var plan = plans.findByIdForUpdate(productId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
                ZonedDateTime schedule = scheduledStart(plan);
                Instant startsAt = schedule.toInstant();
                if (startsAt.isBefore(now.plus(Duration.ofMinutes(31)))) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "The session starts too soon for checkout");
                }
                if (startsAt.isBefore(expiresAt)) {
                    expiresAt = startsAt;
                }
                yield sessionPurchase(clientId, plan, currency, schedule.toLocalDate());
            }
            case PACK, RENEWAL -> packPurchase(clientId, kind, productId, currency, activationDate);
        };
        StripeCheckout.Session session = stripe.create(purchase.getId(), purchase.getDescription(),
                purchase.getUnitAmount(), purchase.getCurrency(), expiresAt);
        verifyDetails(session, purchase);
        if (!"open".equals(session.status()) || session.url() == null
                || !"https".equals(URI.create(session.url()).getScheme())) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Stripe did not return an open Checkout session");
        }
        purchase.attachSession(session.id(), session.url());
        return purchases.save(purchase);
    }

    @Transactional(readOnly = true)
    public CheckoutPurchase findOwned(String id, Long clientId) {
        return purchases.findById(id).filter(purchase -> clientId.equals(purchase.getClientId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void accept(StripeCheckout.Session session, Instant confirmedAt) {
        var record = purchases.findByProviderSessionId(session.id());
        if (record.isEmpty()) {
            return;
        }
        CheckoutPurchase purchase = record.get();
        // A return request may already have loaded this order before the webhook committed.
        entityManager.refresh(purchase);
        verifyDetails(session, purchase);
        if (purchase.getState() != State.OPEN) {
            return;
        }
        if ("expired".equals(session.status())) {
            purchase.expire();
        } else if ("complete".equals(session.status()) && "paid".equals(session.paymentStatus())) {
            fulfill(purchase, confirmedAt);
        }
    }

    private ZonedDateTime scheduledStart(Plan plan) {
        if (plan.getDate() != null && plan.getDebut() != null) {
            try {
                // The calendar sends a date-only value, parsed by Jackson at UTC midnight.
                LocalDate day = Instant.ofEpochMilli(plan.getDate().getTime()).atZone(ZoneOffset.UTC).toLocalDate();
                return day.atTime(LocalTime.parse(plan.getDebut(), SESSION_TIME)).atZone(ZoneId.systemDefault());
            } catch (DateTimeParseException ignored) {
                // A session with invalid scheduling data cannot be sold.
            }
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Session time is unavailable");
    }

    private CheckoutPurchase sessionPurchase(Long clientId, Plan plan, String currency, LocalDate day) {
        Long planId = plan.getId();
        if (plan.getCoach() == null || !plan.getCoach().isEtat()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Session is unavailable");
        }
        if (reservations.countByPlanIdAndClientId(planId, clientId) > 0
                || reservations.countByPlanId(planId) + purchases.countByKindAndProductIdAndState(Kind.SESSION, planId, State.OPEN)
                >= ReservationService.CAPACITY) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Session is booked or full");
        }
        String title = plan.getCategory() == null ? "Séance" : description(plan.getCategory().getNom(), "Séance");
        String label = description(title + " - " + day + " " + plan.getDebut(), "Séance");
        return new CheckoutPurchase(clientId, planId, Kind.SESSION, label,
                minorUnits(plan.getPrix()), currency, null);
    }

    private CheckoutPurchase packPurchase(Long clientId, Kind kind, Long packId, String currency, LocalDate activationDate) {
        var pack = packs.findByIdForUpdate(packId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (pack.getSalle() == null || !pack.getSalle().isEtat()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Pack is unavailable");
        }
        if (kind == Kind.PACK && (activationDate == null || activationDate.isBefore(LocalDate.now()))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose today or a future activation date");
        }
        if (kind == Kind.RENEWAL && !subscriptions.existsByClientIdAndPackId(clientId, packId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A prior subscription is required for renewal");
        }
        String title = description(pack.getNom(), "Gym pack");
        String label = kind == Kind.RENEWAL ? description("Renouvellement - " + title, title) : title;
        return new CheckoutPurchase(clientId, packId, kind, label, minorUnits(pack.getPrix()), currency,
                kind == Kind.PACK ? activationDate : null);
    }

    private void fulfill(CheckoutPurchase purchase, Instant confirmedAt) {
        Client client = lockClient(purchase.getClientId());
        if (purchase.getKind() == Kind.SESSION) {
            var plan = plans.findByIdForUpdate(purchase.getProductId()).orElseThrow();
            var reservation = reservationService.reserve(plan, client);
            purchase.complete(reservation.getId(), null, confirmedAt);
            return;
        }
        var pack = packs.findByIdForUpdate(purchase.getProductId()).orElseThrow();
        LocalDate paidDate = confirmedAt.atZone(ZoneId.systemDefault()).toLocalDate();
        var subscription = abonnementService.activatePaidTerm(client, pack, BigDecimal.valueOf(purchase.getUnitAmount(), 2),
                purchase.getActivationDate(), paidDate);
        purchase.complete(subscription.getId(), AbonnementServiceImpl.localDate(subscription.getDateActivation()), confirmedAt);
    }

    private Client lockClient(Long clientId) {
        Client client = clients.findByIdForUpdate(clientId);
        if (client == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return client;
    }

    private void verifyDetails(StripeCheckout.Session session, CheckoutPurchase purchase) {
        if (!purchase.getId().equals(session.reference()) || !purchase.getCurrency().equals(session.currency())
                || !"payment".equals(session.mode()) || !Objects.equals(purchase.getUnitAmount(), session.amount())) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Checkout payment details do not match the order");
        }
    }

    private long minorUnits(Float price) {
        if (price != null && Float.isFinite(price)) {
            BigDecimal amount = new BigDecimal(price.toString()).setScale(2, RoundingMode.HALF_UP);
            if (amount.signum() > 0 && amount.compareTo(new BigDecimal("999999.99")) <= 0) {
                return amount.movePointRight(2).longValueExact();
            }
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Product price is unavailable");
    }

    private String description(String title, String fallback) {
        String label = title == null || title.isBlank() ? fallback : title.strip();
        int length = Math.min(label.codePointCount(0, label.length()), 255);
        return label.substring(0, label.offsetByCodePoints(0, length));
    }
}
