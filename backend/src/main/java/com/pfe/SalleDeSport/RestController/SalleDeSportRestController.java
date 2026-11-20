package com.pfe.SalleDeSport.RestController;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.access.prepost.PreAuthorize;
import com.pfe.SalleDeSport.Security.SessionTokens;
import com.pfe.SalleDeSport.Dto.ClientSubscriptionDTO;
import com.pfe.SalleDeSport.Entity.*;
import com.pfe.SalleDeSport.Repository.SalleDeSportRepository;
import com.pfe.SalleDeSport.Service.AbonnementService;
import com.pfe.SalleDeSport.Service.EmailSservice;
import com.pfe.SalleDeSport.Service.SalleDeSportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping(value = "/salleDeSport")
public class SalleDeSportRestController {
    @Autowired
    private SessionTokens sessionTokens;

    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    @Autowired
    SalleDeSportService salleDeSportService;
    @Autowired
    SalleDeSportRepository salleDeSportRepository;
    @Autowired
    EmailSservice emailSservice;
    @Autowired
    private AbonnementService abonnementService;

    @RequestMapping(method = RequestMethod.POST)
    ResponseEntity<?> AjouterSalleDeSport(@RequestBody SalleDeSport salleDeSport) {
        salleDeSport.setId(null);
        salleDeSport.setEtat(false);
        HashMap<String, Object> response = new HashMap<>();
        if (salleDeSportRepository.existsByEmail(salleDeSport.getEmail())) {
            response.put("message", "email exist deja !");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } else {
            salleDeSport.setMp(this.bCryptPasswordEncoder.encode(salleDeSport.getMp()));
            SalleDeSport savedsalleDeSport = salleDeSportService.ajouterSalleDeSport(salleDeSport);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedsalleDeSport);
        }
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    public void suppSalleDeSport(@PathVariable("id") Long id) {
        salleDeSportService.supprimerSalleDeSport(id);
    }

    @RequestMapping(method = RequestMethod.GET)
    public List<SalleDeSport> afficherSalleDeSport() {
        return salleDeSportService.afficherSalleDeSport();
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginSalleDeSport(@RequestBody SalleDeSport salleDeSport) {
        SalleDeSport account = salleDeSport.getEmail() == null ? null : salleDeSportRepository.findByEmail(salleDeSport.getEmail());
        if (account == null || salleDeSport.getMp() == null || !bCryptPasswordEncoder.matches(salleDeSport.getMp(), account.getMp())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Identifiants invalides"));
        }
        if (!account.isEtat()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Compte en attente d'approbation"));
        }
        String token = sessionTokens.issue("salle", account.getId(), null, account.getNom());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @RequestMapping(value = "/{id}" , method = RequestMethod.GET)
    public Optional<SalleDeSport> getSalleById(@PathVariable("id") Long id){
        Optional<SalleDeSport> salle = salleDeSportService.afficherSalleById(id);
        return salle;
    }

    @RequestMapping(value = "edit/{id}", method = RequestMethod.PUT)
    @PreAuthorize("@accountAccess.ownsAccount(authentication, #id)")
    public SalleDeSport modifierSalle(
            @PathVariable("id") Long id,
            @RequestBody SalleDeSport salleDeSport,
            @RequestHeader(value = "X-Current-Password", required = false) String currentPassword) {
        SalleDeSport existingSalle = salleDeSportRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("SalleDeSport not found with id: " + id));

        // Update only provided fields
        if (salleDeSport.getNom() != null) {
            existingSalle.setNom(salleDeSport.getNom());
        }
        if (salleDeSport.getAdresse() != null) {
            existingSalle.setAdresse(salleDeSport.getAdresse());
        }
        if (salleDeSport.getTelephone() != null) {
            existingSalle.setTelephone(salleDeSport.getTelephone());
        }
        // Password update
        if (salleDeSport.getMp() != null && !salleDeSport.getMp().trim().isEmpty()) {
            if (currentPassword == null || !bCryptPasswordEncoder.matches(currentPassword, existingSalle.getMp())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
            }
            existingSalle.setMp(bCryptPasswordEncoder.encode(salleDeSport.getMp()));
        }
        return salleDeSportService.modifierSalleDeSport(existingSalle);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
    public SalleDeSport modifierSalleDeSport(@RequestBody SalleDeSport salleDeSport, @PathVariable("id") Long id) {
        SalleDeSport account = salleDeSportRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (salleDeSport.isEtat() != account.isEtat()) {
            String etat = account.isEtat() ? "Bloqué" : "Accepté";
            emailSservice.SendSimpleMessage(account.getEmail(), "L'etat de votre compte", "votre compte a été " + etat);
        }
        account.setEtat(salleDeSport.isEtat());
        return salleDeSportRepository.save(account);
    }

    @GetMapping("/my-clients")
    public List<ClientSubscriptionDTO> getMyClients(@AuthenticationPrincipal Jwt jwt) {
        Long salleId = Long.valueOf(jwt.getSubject());
        return abonnementService.getAbonnementsBySalleId(salleId).stream()
                .filter(abonnement -> abonnement.getClient() != null)
                .map(abonnement -> new ClientSubscriptionDTO(
                        abonnement.getClient().getId(),
                        abonnement.getClient().getNom(),
                        abonnement.getClient().getPrenom(),
                        abonnement.getClient().getEmail(),
                        abonnement.getClient().getTelephone(),
                        abonnement.getClient().getAge(),
                        abonnement.getPack().getNom(),
                        abonnement.getPaymentDate(),
                        abonnement.getDateActivation(),
                        abonnement.getEtat()
                ))
                .toList();

    }
}
