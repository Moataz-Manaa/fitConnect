package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Dto.SaveCoach;
import com.pfe.SalleDeSport.Entity.*;
import com.pfe.SalleDeSport.Repository.CoachSalleRepository;
import com.pfe.SalleDeSport.Repository.SalleDeSportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CoachSalleServiceImpl implements CoachSalleService {
    @Autowired
    CoachSalleRepository coachSalleRepository;
    @Autowired
    SalleDeSportRepository salleDeSportRepository;

    @Override
    public CoachSalle ajouterCoach(SaveCoach coach) {
        CoachSalle coachSalle = SaveCoach.toEntity(coach);
        SalleDeSport salleDeSport = salleDeSportRepository.findById(coach.getIdSalle()).get();
        coachSalle.setSalleDeSport(salleDeSport);
        coachSalle.setActivity(coach.getActivity());
        return coachSalleRepository.save(coachSalle);
    }

    @Override
    public List<CoachSalle> afficherCoach() {
        return coachSalleRepository.findAll();
    }

    @Override
    public void supprimerCoach(Long id) {
        coachSalleRepository.deleteById(id);
    }

    @Override
    public CoachSalle modifierCoach(SaveCoach model, Long id) {
        Optional<CoachSalle> optionalCoach = coachSalleRepository.findById(id);
        if (!optionalCoach.isPresent()) {
            throw new RuntimeException("Coach not found");
        }

        CoachSalle coachSalle = optionalCoach.get();
        coachSalle.setNom(model.getNom());
        coachSalle.setPrenom(model.getPrenom());
        coachSalle.setAge(model.getAge());
        coachSalle.setActivity(model.getActivity());

        if (model.getImage() != null && !model.getImage().isEmpty()) {
            coachSalle.setImage(model.getImage());
        }

        SalleDeSport salle = salleDeSportRepository.findById(model.getIdSalle())
                .orElseThrow(() -> new RuntimeException("Salle not found"));
        coachSalle.setSalleDeSport(salle);

        return coachSalleRepository.save(coachSalle);
    }

    @Override
    public Optional<CoachSalle> afficherCoachById(Long id) {
        return coachSalleRepository.findById(id);
    }

    @Override
    public List<CoachSalle> afficherCoachBySalleId(Long salleId) {
        return coachSalleRepository.findBySalleDeSportId(salleId);
    }
}