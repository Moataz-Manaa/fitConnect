package com.pfe.SalleDeSport.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.SalleDeSport.Entity.Admin;
import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Entity.Coach;
import com.pfe.SalleDeSport.Repository.ClientRepository;
import com.pfe.SalleDeSport.Service.ClientService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.*;

@RestController
@CrossOrigin("*")
@RequestMapping(value = "/client")
public class ClientRestController {
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
        HashMap<String, Object> response = new HashMap<>();

        Client userFromDB = clientRepository.findByEmail(client.getEmail());

        if (userFromDB == null) {
            response.put("message", "Client not found !");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } else {
            boolean compare = this.bCryptPasswordEncoder.matches(client.getMp(), userFromDB.getMp());
            if (!compare) {
                response.put("message", "client not found !");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }else {
                if (userFromDB.isEtat() == true) {
                    String token = Jwts.builder()
                            .claim("data", userFromDB)
                            .signWith(SignatureAlgorithm.HS256, "SECRET")
                            .compact();
                    response.put("token", token);

                    return ResponseEntity.status(HttpStatus.OK).body(response);
                } else {
                    response.put("message", "client inactif");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
                }

            }
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestParam String email) {
        return clientService.forgotPassword(email);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestParam String token,
                                           @RequestParam String newPassword) {
        return clientService.resetPassword(token, newPassword);
    }


    @RequestMapping(value = "/{id}" , method = RequestMethod.GET)
    public Optional<Client> getClientById(@PathVariable("id") Long id){
        Optional<Client> client = clientService.afficherClientById(id);
        return client;
    }

    @RequestMapping(value = "edit/{id}", method = RequestMethod.PUT)
    public Client modifierClient(
            @PathVariable("id") Long id,
            @RequestBody Client client,
            @RequestParam(value = "currentPassword", required = false) String currentPassword) {
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
                throw new IllegalArgumentException("Current password is incorrect");
            }
            existingClient.setMp(bCryptPasswordEncoder.encode(client.getMp()));
        }
        // Email and etat are preserved
        if (client.getEmail() != null) {
            existingClient.setEmail(client.getEmail());
        }
        return clientService.modifierClient(existingClient);
    }

    private static final String GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    @PostMapping("/login-google")
    public ResponseEntity<Map<String, Object>> loginWithGoogle(@RequestParam("id_token") String idToken) {
        Map<String, Object> response = new HashMap<>();
        try {
            String googleUserInfo = validateGoogleToken(idToken);
            JsonNode userInfo = new ObjectMapper().readTree(googleUserInfo);

            String email = userInfo.get("email").asText();
            String fullName = userInfo.get("name").asText();
            String firstName = fullName.split(" ")[0]; // Prenons le prénom comme étant la première partie du nom complet
            String lastName = fullName.split(" ").length > 1 ? fullName.split(" ")[1] : ""; // Nom de famille s'il existe

            Client existingClient = clientRepository.findByEmail(email);

            if (existingClient == null) {

                Client newClient = new Client();
                newClient.setEmail(email);
                newClient.setNom(lastName); // Nom
                newClient.setPrenom(firstName); // Prénom
                newClient.setMp("defaultPassword"); // Mot de passe temporaire, à changer plus tard
                newClient.setEtat(true);  // Statut actif

                clientRepository.save(newClient);
                existingClient = newClient;
            }

            String token = generateToken(existingClient);
            response.put("token", token);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            response.put("message", "Erreur lors du traitement du token Google : " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("message", "Une erreur inconnue est survenue.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private String validateGoogleToken(String idToken) {
        String url = GOOGLE_TOKEN_URL + idToken;
        RestTemplate restTemplate = new RestTemplate();
        return restTemplate.getForObject(url, String.class);
    }

    private String generateToken(Client client) {
        return Jwts.builder()
                .claim("data", client)
                .signWith(SignatureAlgorithm.HS256, "SECRET_KEY")
                .compact();
    }

}
