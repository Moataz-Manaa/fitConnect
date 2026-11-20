package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Abonnement;
import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Entity.Pack;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface AbonnementService {
    Abonnement activatePaidTerm(Client client, Pack pack, BigDecimal amount, LocalDate requestedStart, LocalDate paidDate);
    List<Abonnement> listeReservationPack();
    List<Abonnement> getAbonnementsByClientId(Long id);
    List<Abonnement> getAbonnementsBySalleId(Long id);
}
