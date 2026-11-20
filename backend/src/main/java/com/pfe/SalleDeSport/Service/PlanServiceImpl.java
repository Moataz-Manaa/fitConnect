package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Coach;
import com.pfe.SalleDeSport.Entity.Plan;
import com.pfe.SalleDeSport.Dto.SavePlan;
import com.pfe.SalleDeSport.Entity.Category;
import com.pfe.SalleDeSport.Entity.CheckoutPurchase.Kind;
import com.pfe.SalleDeSport.Entity.CheckoutPurchase.State;
import com.pfe.SalleDeSport.Repository.CheckoutPurchaseRepository;
import com.pfe.SalleDeSport.Repository.ReservationRepository;
import com.pfe.SalleDeSport.Repository.CoachRepository;
import com.pfe.SalleDeSport.Repository.PlanRepository;
import com.pfe.SalleDeSport.Repository.CategoryRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;


import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class PlanServiceImpl implements PlanService {

    @Autowired
    PlanRepository planRepository;
    @Autowired
    CoachRepository coachRepository;
    @Autowired
    CheckoutPurchaseRepository purchases;
    @Autowired
    ReservationRepository reservations;
    @Autowired
    CategoryRepository categoryRepository;
    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Plan ajouterPlanning(SavePlan model) {
        Plan planning = SavePlan.toEntity(model);
        Coach coach = coachRepository.findById(model.getIdCoach()).orElseThrow(() -> new RuntimeException("Coach not found"));
        Category category = categoryRepository.findById(model.getIdCategory()).orElseThrow(() -> new RuntimeException("Category not found"));
        planning.setCoach(coach);
        planning.setCategory(category);
        return planRepository.save(planning);
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public Plan updatePlanning(Long id, SavePlan model) {
        Plan planning = planRepository.findByIdForUpdate(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        entityManager.refresh(planning);
        boolean changesSession = !Objects.equals(epochMillis(planning.getDate()), epochMillis(model.getDate()))
                || !Objects.equals(planning.getDebut(), model.getDebut())
                || !Objects.equals(planning.getFin(), model.getFin())
                || !Objects.equals(planning.getCoach() == null ? null : planning.getCoach().getId(), model.getIdCoach())
                || !Objects.equals(planning.getCategory() == null ? null : planning.getCategory().getId(), model.getIdCategory());
        if (changesSession && hasBookings(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A booking or payment is already associated with this session");
        }
        planning.setDate(model.getDate());
        planning.setDebut(model.getDebut());
        planning.setFin(model.getFin());
        planning.setDescription(model.getDescription());
        planning.setPrix(model.getPrix());
        Coach coach = coachRepository.findById(model.getIdCoach()).orElseThrow(() -> new RuntimeException("Coach not found"));
        Category category = categoryRepository.findById(model.getIdCategory()).orElseThrow(() -> new RuntimeException("Category not found"));
        planning.setCoach(coach);
        planning.setCategory(category);
        return planRepository.save(planning);
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void deletePlanning(Long id) {
        Plan planning = planRepository.findByIdForUpdate(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (hasBookings(id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A booking or payment is already associated with this session");
        }
        planRepository.delete(planning);
    }

    private Long epochMillis(Date date) {
        return date == null ? null : date.getTime();
    }

    private boolean hasBookings(Long id) {
        return reservations.countByPlanId(id) > 0
                || purchases.countByKindAndProductIdAndState(Kind.SESSION, id, State.OPEN) > 0;
    }

    @Override
    public List<Plan> afficherPlanning() {
        return planRepository.findAll();
    }

    @Override
    public Optional<Plan> afficherPlanninigById(Long id) {
        return planRepository.findById(id);
    }

    @Override
    public List<Plan> getplanningByCoachId(Long id) {
        return planRepository.findByCoachId(id);
    }
}