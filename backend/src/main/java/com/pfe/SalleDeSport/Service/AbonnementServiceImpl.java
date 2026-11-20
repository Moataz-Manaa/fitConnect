package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Abonnement;
import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Entity.Pack;
import com.pfe.SalleDeSport.Repository.AbonnementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class AbonnementServiceImpl implements AbonnementService {
    static final int TERM_DAYS = 30;
    private final AbonnementRepository subscriptions;

    public AbonnementServiceImpl(AbonnementRepository subscriptions) {
        this.subscriptions = subscriptions;
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public Abonnement activatePaidTerm(Client client, Pack pack, BigDecimal amount, LocalDate requestedStart, LocalDate paidDate) {
        LocalDate earliest = requestedStart != null && requestedStart.isAfter(paidDate) ? requestedStart : paidDate;
        LocalDate start = subscriptions.findByClientIdAndPackId(client.getId(), pack.getId()).stream()
                .map(Abonnement::getDateActivation).filter(Objects::nonNull)
                .map(AbonnementServiceImpl::localDate).map(date -> date.plusDays(TERM_DAYS))
                .filter(date -> date.isAfter(earliest)).max(Comparator.naturalOrder()).orElse(earliest);
        Abonnement subscription = new Abonnement();
        subscription.setClient(client);
        subscription.setPack(pack);
        subscription.setPrix(amount);
        subscription.setPaymentDate(Date.valueOf(paidDate));
        subscription.setDateCreation(Date.valueOf(paidDate));
        subscription.setDateActivation(Date.valueOf(start));
        updateStatus(subscription, LocalDate.now());
        return subscriptions.save(subscription);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Abonnement> listeReservationPack() {
        return withCurrentStatus(subscriptions.findAll());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Abonnement> getAbonnementsByClientId(Long id) {
        return withCurrentStatus(subscriptions.findByClientId(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Abonnement> getAbonnementsBySalleId(Long id) {
        return withCurrentStatus(subscriptions.findByPackSalleId(id));
    }

    private List<Abonnement> withCurrentStatus(List<Abonnement> result) {
        LocalDate today = LocalDate.now();
        result.forEach(subscription -> updateStatus(subscription, today));
        return result;
    }

    private void updateStatus(Abonnement subscription, LocalDate today) {
        var activation = subscription.getDateActivation();
        if (activation == null || !today.isBefore(localDate(activation).plusDays(TERM_DAYS))) {
            subscription.setEtat("inactif");
        } else if (today.isBefore(localDate(activation))) {
            subscription.setEtat("en_attente");
        } else {
            subscription.setEtat("actif");
        }
    }

    static LocalDate localDate(java.util.Date date) {
        return new Date(date.getTime()).toLocalDate();
    }
}
