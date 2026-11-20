package com.pfe.SalleDeSport.RestController;

import org.springframework.security.access.prepost.PreAuthorize;
import com.pfe.SalleDeSport.Entity.Plan;
import com.pfe.SalleDeSport.Dto.SavePlan;
import com.pfe.SalleDeSport.Repository.PlanRepository;
import com.pfe.SalleDeSport.Service.PlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/plan")
public class PlanRestController {

    @Autowired
    PlanService planningCService;
    @Autowired
    PlanRepository planningCRepository;

    @PostMapping
    @PreAuthorize("#model.id == null and @accountAccess.ownsAccount(authentication, #model.idCoach)")
    public ResponseEntity<?> ajouterPlanningCoach(@RequestBody SavePlan model) {
        if (planningCRepository.existsByDateAndDebutAndFinAndCoach_Id(
                model.getDate(), model.getDebut(), model.getFin(), model.getIdCoach())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Ce planning existe déjà pour ce coach !");
        }
        Plan savedPlanning = planningCService.ajouterPlanning(model);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPlanning);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@accountAccess.ownsPlan(authentication, #id) and @accountAccess.ownsAccount(authentication, #model.idCoach)")
    public ResponseEntity<?> updatePlanningCoach(@PathVariable Long id, @RequestBody SavePlan model) {
        if (planningCRepository.existsByDateAndDebutAndFinAndCoach_Id(
                model.getDate(), model.getDebut(), model.getFin(), model.getIdCoach())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Ce planning existe déjà pour ce coach !");
        }
        Plan updatedPlanning = planningCService.updatePlanning(id, model);
        return ResponseEntity.ok(updatedPlanning);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@accountAccess.ownsPlan(authentication, #id)")
    public ResponseEntity<Void> deletePlanningCoach(@PathVariable Long id) {
        planningCService.deletePlanning(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public List<Plan> afficherPlanning() {
        return planningCService.afficherPlanning();
    }

    @GetMapping("/coach/{id}")
    public List<Plan> listPlanningByCoach(@PathVariable Long id) {
        return planningCService.getplanningByCoachId(id);
    }
}