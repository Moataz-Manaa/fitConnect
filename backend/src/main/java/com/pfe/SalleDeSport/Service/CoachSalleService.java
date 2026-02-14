package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.CoachSalle;
import com.pfe.SalleDeSport.Dto.SaveCoach;

import java.util.List;
import java.util.Optional;

public interface CoachSalleService {
    CoachSalle ajouterCoach(SaveCoach coach);
    List<CoachSalle> afficherCoach();
    void supprimerCoach(Long id);
    CoachSalle modifierCoach(SaveCoach coach, Long id);
    Optional<CoachSalle> afficherCoachById(Long id);
    List<CoachSalle> afficherCoachBySalleId(Long salleId);
}
