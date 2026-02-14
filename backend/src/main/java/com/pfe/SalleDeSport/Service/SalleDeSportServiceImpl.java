package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Entity.CoachSalle;
import com.pfe.SalleDeSport.Entity.SalleDeSport;
import com.pfe.SalleDeSport.Repository.CoachSalleRepository;
import com.pfe.SalleDeSport.Repository.SalleDeSportRepository;
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
public class SalleDeSportServiceImpl implements SalleDeSportService{

    @Autowired
    SalleDeSportRepository salleDeSportRepository;
    @Autowired
    CoachSalleRepository coachSalleRepository;

    @Override
    public SalleDeSport ajouterSalleDeSport(SalleDeSport salleDeSport) {
        return salleDeSportRepository.save(salleDeSport);
    }

    @Override
    public List<SalleDeSport> afficherSalleDeSport() {
        return salleDeSportRepository.findAll();
    }

    @Override
    public void supprimerSalleDeSport(Long id) {
        salleDeSportRepository.deleteById(id);
    }

    @Override
    public SalleDeSport modifierSalleDeSport(SalleDeSport salleDeSport) {
        return salleDeSportRepository.save(salleDeSport);
    }

    @Override
    public Optional<SalleDeSport> afficherSalleById(Long id) {
        return salleDeSportRepository.findById(id);
    }
}
