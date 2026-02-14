package com.pfe.SalleDeSport.Repository;

import com.pfe.SalleDeSport.Entity.Abonnement;
import com.pfe.SalleDeSport.Entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByClientId(Long id);

    long countByPlanIdAndClientId(Long idPlan, Long idClient);

    long countByPlanId(Long idPlan);

    List<Reservation> findByclientId(Long id);

    List<Reservation> findByPlanCoachId(Long coachId);

    //List<Reservation> findReservationByCoachId(Long coachId);

    // List<Reservation> findByCoachId(Long coachId);
}
