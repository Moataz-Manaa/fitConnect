package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Plan;
import com.pfe.SalleDeSport.Dto.SavePlan;

import java.util.List;
import java.util.Optional;

public interface PlanService {
    Plan ajouterPlanning(SavePlan model);

    Plan updatePlanning(Long id, SavePlan model);

    void deletePlanning(Long id);

    List<Plan> afficherPlanning();
    Optional<Plan> afficherPlanninigById(Long id);
    List<Plan> getplanningByCoachId(Long id);

}
