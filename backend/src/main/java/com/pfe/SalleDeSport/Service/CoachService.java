package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Entity.Coach;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

public interface CoachService {
    Coach ajouterCoach(Coach coach);
    List<Coach> afficherCoach();
    void supprimerCoach(Long id);
    Coach modifierCoach(Coach coach);
    Optional<Coach> afficherCoachById(Long id);

}
