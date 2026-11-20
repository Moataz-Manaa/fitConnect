package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Entity.Plan;
import com.pfe.SalleDeSport.Entity.Reservation;
import com.pfe.SalleDeSport.Repository.ReservationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ReservationServiceImpl implements ReservationService {
    private final ReservationRepository reservations;

    public ReservationServiceImpl(ReservationRepository reservations) {
        this.reservations = reservations;
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public Reservation reserve(Plan plan, Client client) {
        if (reservations.countByPlanIdAndClientId(plan.getId(), client.getId()) > 0
                || reservations.countByPlanId(plan.getId()) >= CAPACITY) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Reservation is no longer available");
        }
        Reservation reservation = new Reservation();
        reservation.setPlan(plan);
        reservation.setClient(client);
        return reservations.save(reservation);
    }

    @Override
    public List<Reservation> AfficherReservation() {
        return reservations.findAll();
    }

    @Override
    public List<Reservation> listePlanningByClient(Long id) {
        return reservations.findByClientId(id);
    }

    @Override
    public List<Reservation> getReservationByCoach(Long coachId) {
        return reservations.findByPlanCoachId(coachId);
    }
}
