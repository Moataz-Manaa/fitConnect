package com.pfe.SalleDeSport.RestController;

import com.pfe.SalleDeSport.Entity.*;
import com.pfe.SalleDeSport.Repository.CoachRepository;
import com.pfe.SalleDeSport.Repository.ReservationRepository;
import com.pfe.SalleDeSport.Service.CoachService;
import com.pfe.SalleDeSport.Service.EmailSservice;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin("*")
@RequestMapping(value = "/coach")
public class CoachRestController {
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
        HashMap<String, Object> response = new HashMap<>();

        Coach userFromDB = coachRepository.findByEmail(coach.getEmail());

        if (userFromDB == null) {
            response.put("message", "coach not found !");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } else {
            boolean compare = this.bCryptPasswordEncoder.matches(coach.getMp(), userFromDB.getMp());
            if (!compare) {
                response.put("message", "coach not found !");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            } else {
                Map<String, Object> data = new HashMap<>();
                data.put("id", userFromDB.getId());
                data.put("nom", userFromDB.getNom());
                data.put("prenom", userFromDB.getNom());
                data.put("email", userFromDB.getEmail());
                data.put("mp", userFromDB.getMp());
                data.put("telephone", userFromDB.getTelephone());
                data.put("etat", userFromDB.isEtat());

                String token = Jwts.builder()
                        .claim("data", userFromDB)
                        .signWith(SignatureAlgorithm.HS256, "SECRET")
                        .compact();
                response.put("token", token);
                //response.put("role",userFromDB.getRole());

                return ResponseEntity.status(HttpStatus.OK).body(response);
            }
        }
    }

    @RequestMapping(value = "/{id}" , method = RequestMethod.GET)
    public Optional<Coach> getCoachById(@PathVariable("id") Long id){
        Optional<Coach> coach = coachService.afficherCoachById(id);
        return coach;
    }

    @RequestMapping(value = "edit/{id}", method = RequestMethod.PUT)
    public Coach editCoach(
            @PathVariable("id") Long id,
            @RequestBody Coach coach,
            @RequestParam(value = "currentPassword", required = false) String currentPassword) {
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
                throw new IllegalArgumentException("Current password is incorrect");
            }
            existingCoach.setMp(bCryptPasswordEncoder.encode(coach.getMp()));
        }
        // Email and etat are preserved
        if (coach.getEmail() != null) {
            existingCoach.setEmail(coach.getEmail());
        }
        return coachService.modifierCoach(existingCoach);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
    public Coach modifierCoach(@RequestBody Coach coach, @PathVariable("id") Long id) {
        Coach newCoach = null;
        if (coachRepository.findById(id).isPresent()) {
            Coach coach1 = coachRepository.findById(id).get();
            var salleId = coach.getId();
            var nom = coach.getNom();
            var prenom = coach.getPrenom();
            var email = coach.getEmail();
            var mp = coach.getMp();
            var tel = coach.getTelephone();
            coach.setId(salleId);
            coach.setNom(nom);
            coach.setPrenom(prenom);
            coach.setEmail(email);
            coach.setMp(mp);
            coach.setTelephone(tel);

            coach.setMp(this.bCryptPasswordEncoder.encode(coach1.getMp()));
            if (coach.isEtat() != coach1.isEtat()) {
                String etat = coach1.isEtat() ? "Bloqué" : "Accepté";
                emailSservice.SendSimpleMessage(coach1.getEmail(), "L'etat de votre compte", "votre compte a été " + etat);
            }
            coach1.setEtat(coach.isEtat());
            newCoach = coachRepository.save(coach1);
        }
        return newCoach;
    }

/*
    @GetMapping("/{coachId}/clients")
    public ResponseEntity<List<Client>> getCoachClients(@PathVariable("coachId") Long coachId) {
        // Fetch reservations for the coach
        List<Reservation> reservations = reservationRepository.findByCoachId(coachId);

        // Extract unique clients from reservations
        List<Client> clients = reservations.stream()
                .map(Reservation::getClient)
                .distinct()
                .collect(Collectors.toList());

        return ResponseEntity.ok(clients);
    }
*/
}
