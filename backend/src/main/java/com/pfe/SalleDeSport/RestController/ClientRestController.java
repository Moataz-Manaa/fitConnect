package com.pfe.SalleDeSport.RestController;

import org.springframework.security.access.prepost.PreAuthorize;
import com.pfe.SalleDeSport.Security.SessionTokens;
import com.pfe.SalleDeSport.Security.GoogleIdentity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Repository.ClientRepository;
import com.pfe.SalleDeSport.Service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping(value = "/client")
public class ClientRestController {
    @Autowired
    private SessionTokens sessionTokens;
    @Autowired
    private GoogleIdentity googleIdentity;
    @Autowired
    ClientService clientService;
    @Autowired
    ClientRepository clientRepository;

    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    @RequestMapping(method = RequestMethod.POST)
    public ResponseEntity<Object> AjouterClient(@RequestBody Client client) {
        return clientService.ajouterClient(client);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE )
    public void suppClient(@PathVariable("id") Long id){
        clientService.supprimerClient(id);
    }

    @RequestMapping(method = RequestMethod.GET )
    public List<Client> afficherClient(){
        return clientService.afficherClient();
    }

    @RequestMapping(value="/confirm-account", method= {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<?> confirmUserAccount(@RequestParam("token")String confirmationToken) {
        return clientService.ConfirmeEmail(confirmationToken);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginClient(@RequestBody Client client) {
        Client account = client.getEmail() == null ? null : clientRepository.findByEmail(client.getEmail());
        if (account == null || client.getMp() == null || !bCryptPasswordEncoder.matches(client.getMp(), account.getMp())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Identifiants invalides"));
        }
        if (!account.isEtat()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Compte inactif"));
        }
        String token = sessionTokens.issue("client", account.getId(), account.getPrenom(), account.getNom());
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return clientService.forgotPassword(request.email());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request.token() == null || request.newPassword() == null || request.newPassword().isBlank()) {
            return ResponseEntity.badRequest().body("Token and new password are required");
        }
        return clientService.resetPassword(request.token(), request.newPassword());
    }


    @RequestMapping(value = "/{id}" , method = RequestMethod.GET)
    @PreAuthorize("hasRole('admin') or @accountAccess.ownsAccount(authentication, #id)")
    public Optional<Client> getClientById(@PathVariable("id") Long id){
        Optional<Client> client = clientService.afficherClientById(id);
        return client;
    }

    @RequestMapping(value = "edit/{id}", method = RequestMethod.PUT)
    @PreAuthorize("@accountAccess.ownsAccount(authentication, #id)")
    public Client modifierClient(
            @PathVariable("id") Long id,
            @RequestBody Client client,
            @RequestHeader(value = "X-Current-Password", required = false) String currentPassword) {
        Client existingClient = clientRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Client not found with id: " + id));

        // Update only provided fields
        if (client.getNom() != null) {
            existingClient.setNom(client.getNom());
        }
        if (client.getPrenom() != null) {
            existingClient.setPrenom(client.getPrenom());
        }
        if (client.getTelephone() != null) {
            existingClient.setTelephone(client.getTelephone());
        }
        if (client.getAge() != 0) { // Assuming 0 is not a valid age
            existingClient.setAge(client.getAge());
        }
        // Password update
        if (client.getMp() != null && !client.getMp().trim().isEmpty()) {
            if (currentPassword == null || !bCryptPasswordEncoder.matches(currentPassword, existingClient.getMp())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
            }
            existingClient.setMp(bCryptPasswordEncoder.encode(client.getMp()));
        }
        return clientService.modifierClient(existingClient);
    }

    @PostMapping("/login-google")
    public ResponseEntity<Map<String, Object>> loginWithGoogle(@RequestBody GoogleLoginRequest request) {
        Jwt identity;
        try {
            identity = googleIdentity.verify(request.idToken());
        } catch (JwtException | IllegalArgumentException invalidToken) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Identifiants Google invalides"));
        }

        String email = identity.getClaimAsString("email");
        Client client = clientRepository.findByEmail(email);
        if (client == null) {
            client = new Client();
            client.setEmail(email);
            client.setNom(Objects.requireNonNullElse(identity.getClaimAsString("family_name"), ""));
            client.setPrenom(Objects.requireNonNullElse(identity.getClaimAsString("given_name"), ""));
            client.setMp(bCryptPasswordEncoder.encode(UUID.randomUUID().toString()));
            client.setEtat(true);
            client = clientRepository.save(client);
        }
        if (!client.isEtat()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Compte inactif"));
        }
        return ResponseEntity.ok(Map.of("token", sessionTokens.issue("client", client.getId(), client.getPrenom(), client.getNom())));
    }

    public record GoogleLoginRequest(String idToken) {}
    public record ForgotPasswordRequest(String email) {}
    public record ResetPasswordRequest(String token, String newPassword) {}
}
