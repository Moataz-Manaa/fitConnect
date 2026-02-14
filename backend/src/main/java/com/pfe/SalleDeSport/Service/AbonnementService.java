package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Abonnement;
import com.pfe.SalleDeSport.Dto.AbonnementRequest;

import java.util.List;

public interface AbonnementService {
    Abonnement ajouterReservationPack(AbonnementRequest reservationPackRq);
    List<Abonnement> listeReservationPack();
    List<Abonnement> GetPackByClient(Long id);
    List<Abonnement> getAbonnementsByClientId(Long id);
    Abonnement renouvelerAbonnement(AbonnementRequest renewalRequest);

}
