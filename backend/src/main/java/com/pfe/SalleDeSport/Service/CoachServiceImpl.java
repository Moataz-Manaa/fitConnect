package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Admin;
import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Entity.Coach;
import com.pfe.SalleDeSport.Repository.CoachRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CoachServiceImpl implements CoachService{
    @Autowired
    CoachRepository coachRepository;

    @Override
    public Coach ajouterCoach(Coach coach) {
        return coachRepository.save(coach);
    }

    @Override
    public List<Coach> afficherCoach() {
        return coachRepository.findAll();
    }

    @Override
    public void supprimerCoach(Long id) {
        coachRepository.deleteById(id);
    }

    @Override
    public Coach modifierCoach(Coach coach) {
        return coachRepository.save(coach);
    }


    @Override
    public Optional<Coach> afficherCoachById(Long id) {
        return coachRepository.findById(id);
    }
}
