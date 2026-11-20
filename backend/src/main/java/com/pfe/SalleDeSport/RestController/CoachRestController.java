package com.pfe.SalleDeSport.RestController;

import org.springframework.security.access.prepost.PreAuthorize;
import com.pfe.SalleDeSport.Security.SessionTokens;
import com.pfe.SalleDeSport.Entity.*;
import com.pfe.SalleDeSport.Repository.CoachRepository;
import com.pfe.SalleDeSport.Repository.ReservationRepository;
import com.pfe.SalleDeSport.Service.CoachService;
import com.pfe.SalleDeSport.Service.EmailSservice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping(value = "/coach")
public class CoachRestController {
    @Autowired
    private SessionTokens sessionTokens;
    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    @Autowired
    CoachService coachService;
    @Autowired
    CoachRepository coachRepository;
    @Autowired
    EmailSservice emailSservice;
    @Autowired
    ReservationRepository reservationRepository;

    @RequestMapping(method = RequestMethod.POST)
    ResponseEntity<?> AjouterCoach (@RequestBody Coach coach){
        coach.setId(null);
        coach.setEtat(false);
        HashMap<String, Object> response = new HashMap<>();
        if(coachRepository.existsByEmail(coach.getEmail())){
            response.put("message", "email exist deja !");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }else{
            coach.setMp(this.bCryptPasswordEncoder.encode(coach.getMp()));
            Coach savedCoach = coachService.ajouterCoach(coach);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCoach);}
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE )
    public void suppCoach(@PathVariable("id") Long id){
        coachService.supprimerCoach(id);
    }

    @RequestMapping(method = RequestMethod.GET )
    public List<Coach> afficherCoach(){
        return coachService.afficherCoach();
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginCoach(@RequestBody Coach coach) {
        Coach account = coach.getEmail() == null ? null : coachRepository.findByEmail(coach.getEmail());
        if (account == null || coach.getMp() == null || !bCryptPasswordEncoder.matches(coach.getMp(), account.getMp())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Identifiants incorrects"));
        }
        if (!account.isEtat()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Compte en attente d'approbation"));
        }
        String token = sessionTokens.issue("coach", account.getId(), account.getPrenom(), account.getNom());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @RequestMapping(value = "/{id}" , method = RequestMethod.GET)
    public Optional<Coach> getCoachById(@PathVariable("id") Long id){
        Optional<Coach> coach = coachService.afficherCoachById(id);
        return coach;
    }

    @RequestMapping(value = "edit/{id}", method = RequestMethod.PUT)
    @PreAuthorize("@accountAccess.ownsAccount(authentication, #id)")
    public Coach editCoach(
            @PathVariable("id") Long id,
            @RequestBody Coach coach,
            @RequestHeader(value = "X-Current-Password", required = false) String currentPassword) {
        Coach existingCoach = coachRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Coach not found with id: " + id));

        // Update only provided fields
        if (coach.getNom() != null) {
            existingCoach.setNom(coach.getNom());
        }
        if (coach.getPrenom() != null) {
            existingCoach.setPrenom(coach.getPrenom());
        }
        if (coach.getTelephone() != null) {
            existingCoach.setTelephone(coach.getTelephone());
        }
        // Password update
        if (coach.getMp() != null && !coach.getMp().trim().isEmpty()) {
            if (currentPassword == null || !bCryptPasswordEncoder.matches(currentPassword, existingCoach.getMp())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
            }
            existingCoach.setMp(bCryptPasswordEncoder.encode(coach.getMp()));
        }
        return coachService.modifierCoach(existingCoach);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
    public Coach modifierCoach(@RequestBody Coach coach, @PathVariable("id") Long id) {
        Coach account = coachRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (coach.isEtat() != account.isEtat()) {
            String etat = account.isEtat() ? "Bloqué" : "Accepté";
            emailSservice.SendSimpleMessage(account.getEmail(), "L'etat de votre compte", "votre compte a été " + etat);
        }
        account.setEtat(coach.isEtat());
        return coachRepository.save(account);
    }

    @GetMapping("/{coachId}/clients")
    @PreAuthorize("@accountAccess.ownsAccount(authentication, #coachId)")
    public ResponseEntity<List<Client>> getCoachClients(@PathVariable("coachId") Long coachId) {
        // Fetch reservations for the coach
        List<Reservation> reservations = reservationRepository.findByPlanCoachId(coachId);

        // Extract unique clients from reservations
        List<Client> clients = reservations.stream()
                .map(Reservation::getClient)
                .distinct()
                .toList();

        return ResponseEntity.ok(clients);
    }
}
