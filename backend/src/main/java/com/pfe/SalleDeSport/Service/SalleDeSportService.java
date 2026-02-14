package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Entity.CoachSalle;
import com.pfe.SalleDeSport.Entity.SalleDeSport;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

public interface SalleDeSportService {
    SalleDeSport ajouterSalleDeSport(SalleDeSport salleDeSport);
    List<SalleDeSport> afficherSalleDeSport();
    void supprimerSalleDeSport(Long id);
    SalleDeSport modifierSalleDeSport(SalleDeSport salleDeSport);
    Optional<SalleDeSport> afficherSalleById(Long id);
}
