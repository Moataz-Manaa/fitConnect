package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Dto.ReservationRequest;
import com.pfe.SalleDeSport.Entity.*;
import com.pfe.SalleDeSport.Repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReservationServiceImpl implements ReservationService{
    @Autowired
    PlanService planningCService;
    @Autowired
    ClientService clientService;
    @Autowired
    ReservationRepository reservationRepository;


    @Override
    public Reservation AjouterReservation(ReservationRequest reservationrq) {
        Optional<Plan> planningc = planningCService.afficherPlanninigById(reservationrq.getIdPlan());
        Optional<Client> client = clientService.afficherClientById(reservationrq.getIdClient());

        if (planningc.isPresent() && client.isPresent()) {
            long existingReservationsCount = reservationRepository.countByPlanIdAndClientId(reservationrq.getIdPlan(), reservationrq.getIdClient());
            if (existingReservationsCount > 0) {
                throw new IllegalArgumentException("Client has already reserved this planning.");
            }

            long totalReservationsForPlanning = reservationRepository.countByPlanId(reservationrq.getIdPlan());
            if (totalReservationsForPlanning >= 3) {
                throw new IllegalArgumentException("This planning has already been reserved the maximum number of times.");
            }

            Reservation reservation = new Reservation();
            reservation.setPlan(planningc.get());
            reservation.setClient(client.get());
            return reservationRepository.save(reservation);
        } else {
            return null;
        }
    }

    @Override
    public List<Reservation> AfficherReservation() {
        return reservationRepository.findAll();
    }

    @Override
    public List<Reservation> listePlanningByClient(Long id) {
        return reservationRepository.findByclientId(id);
    }

    @Override
    public List<Reservation> getReservationByCoach(Long coachId) {
        return reservationRepository.findByPlanCoachId(coachId);
    }

}
