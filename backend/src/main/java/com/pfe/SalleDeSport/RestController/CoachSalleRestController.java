package com.pfe.SalleDeSport.RestController;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.access.prepost.PreAuthorize;
import com.pfe.SalleDeSport.Dto.SaveCoach;
import com.pfe.SalleDeSport.Entity.*;
import com.pfe.SalleDeSport.Service.CoachSalleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping(value = "/coachSalle")
public class CoachSalleRestController {
    @Autowired
    CoachSalleService coachSalleService;

    @RequestMapping(method = RequestMethod.POST)
    @PreAuthorize("#coach.id == null and @accountAccess.ownsAccount(authentication, #coach.idSalle)")
    public CoachSalle AjouterCoachSalle (@RequestBody SaveCoach coach){
        return coachSalleService.ajouterCoach(coach);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE )
    @PreAuthorize("@accountAccess.ownsGymCoach(authentication, #id)")
    public void suppCoach(@PathVariable("id") Long id){
        coachSalleService.supprimerCoach(id);
    }

    @RequestMapping(method = RequestMethod.GET )
    public List<CoachSalle> afficherCoach(){
        return coachSalleService.afficherCoach();
    }

    @RequestMapping(value = "/{id}",method = RequestMethod.GET )
    @PreAuthorize("@accountAccess.ownsGymCoach(authentication, #id)")
    public Optional<CoachSalle> afficherCoachById(@PathVariable("id") Long id){
        return coachSalleService.afficherCoachById(id);
    }

    @GetMapping("/my-coach")
    public List<CoachSalle> getMyCoachs(@AuthenticationPrincipal Jwt jwt) {
        return coachSalleService.afficherCoachBySalleId(Long.valueOf(jwt.getSubject()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@accountAccess.ownsGymCoach(authentication, #id) and @accountAccess.ownsAccount(authentication, #model.idSalle)")
    public ResponseEntity<CoachSalle> updateCoach(@PathVariable Long id, @RequestBody SaveCoach model) {
        return ResponseEntity.ok(coachSalleService.modifierCoach(model, id));
    }

    @GetMapping("/salle/{id}")
    public List<CoachSalle> afficherCoachBySalle(@PathVariable Long id) {
        return coachSalleService.afficherCoachBySalleId(id);
    }


}
