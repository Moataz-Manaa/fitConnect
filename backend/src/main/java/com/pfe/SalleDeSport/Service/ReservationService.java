package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Reservation;
import com.pfe.SalleDeSport.Dto.ReservationRequest;

import java.util.List;

public interface ReservationService {
    Reservation AjouterReservation(ReservationRequest reservationRQ);
    List<Reservation> AfficherReservation();
    List<Reservation> listePlanningByClient(Long id );

    List<Reservation> getReservationByCoach(Long coachId);
}
