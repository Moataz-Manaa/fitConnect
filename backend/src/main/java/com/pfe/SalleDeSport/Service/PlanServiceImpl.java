package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Coach;
import com.pfe.SalleDeSport.Entity.Plan;
import com.pfe.SalleDeSport.Dto.SavePlan;
import com.pfe.SalleDeSport.Entity.Category;
import com.pfe.SalleDeSport.Repository.ClientRepository;
import com.pfe.SalleDeSport.Repository.CoachRepository;
import com.pfe.SalleDeSport.Repository.PlanRepository;
import com.pfe.SalleDeSport.Repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PlanServiceImpl implements PlanService {

    @Autowired
    PlanRepository planRepository;
    @Autowired
    CoachRepository coachRepository;
    @Autowired
    ClientRepository clientRepository;
    @Autowired
    CategoryRepository categoryRepository;

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
    public Plan updatePlanning(Long id, SavePlan model) {
        Plan planning = planRepository.findById(id).orElseThrow(() -> new RuntimeException("Plan not found"));
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
    public void deletePlanning(Long id) {
        Plan planning = planRepository.findById(id).orElseThrow(() -> new RuntimeException("Plan not found"));
        planRepository.delete(planning);
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