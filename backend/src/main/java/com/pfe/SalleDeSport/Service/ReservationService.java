package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Reservation;
import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Entity.Plan;

import java.util.List;

public interface ReservationService {
    int CAPACITY = 3;

    Reservation reserve(Plan plan, Client client);
    List<Reservation> AfficherReservation();
    List<Reservation> listePlanningByClient(Long id );

    List<Reservation> getReservationByCoach(Long coachId);
}
