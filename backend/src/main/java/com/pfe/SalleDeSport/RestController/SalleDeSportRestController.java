package com.pfe.SalleDeSport.RestController;

import com.pfe.SalleDeSport.Dto.ClientSubscriptionDTO;
import com.pfe.SalleDeSport.Entity.*;
import com.pfe.SalleDeSport.Repository.AbonnementRepository;
import com.pfe.SalleDeSport.Repository.PackRepository;
import com.pfe.SalleDeSport.Repository.SalleDeSportRepository;
import com.pfe.SalleDeSport.Service.EmailSservice;
import com.pfe.SalleDeSport.Service.SalleDeSportService;
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
@RequestMapping(value = "/salleDeSport")
public class SalleDeSportRestController {

    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    @Autowired
    SalleDeSportService salleDeSportService;
    @Autowired
    SalleDeSportRepository salleDeSportRepository;
    @Autowired
    EmailSservice emailSservice;
    @Autowired
    private PackRepository packRepository;
    @Autowired
    private AbonnementRepository abonnementRepository;

    @RequestMapping(method = RequestMethod.POST)
    ResponseEntity<?> AjouterSalleDeSport(@RequestBody SalleDeSport salleDeSport) {
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
        Map<String, Object> response = new HashMap<>();

        SalleDeSport userFromDB = salleDeSportRepository.findByEmail(salleDeSport.getEmail());

        if (userFromDB == null) {
            response.put("message", "Salle de sport not found!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        boolean passwordMatches = bCryptPasswordEncoder.matches(salleDeSport.getMp(), userFromDB.getMp());

        if (!passwordMatches) {
            response.put("message", "Invalid credentials!");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        // Build the data manually excluding the image
        Map<String, Object> data = new HashMap<>();
        data.put("id", userFromDB.getId());
        data.put("nom", userFromDB.getNom());
        data.put("email", userFromDB.getEmail());
        data.put("adresse", userFromDB.getAdresse());
        data.put("mp", userFromDB.getMp()); // optional: you might want to remove this too for security
        data.put("telephone", userFromDB.getTelephone());
        data.put("etat", userFromDB.isEtat());

        String token = Jwts.builder()
                .claim("data", data)
                .signWith(SignatureAlgorithm.HS256, "SECRET")
                .compact();

        response.put("token", token);
        return ResponseEntity.ok(response);
    }






    @RequestMapping(value = "/{id}" , method = RequestMethod.GET)
    public Optional<SalleDeSport> getSalleById(@PathVariable("id") Long id){
        Optional<SalleDeSport> salle = salleDeSportService.afficherSalleById(id);
        return salle;
    }

    @RequestMapping(value = "edit/{id}", method = RequestMethod.PUT)
    public SalleDeSport modifierSalle(
            @PathVariable("id") Long id,
            @RequestBody SalleDeSport salleDeSport,
            @RequestParam(value = "currentPassword", required = false) String currentPassword) {
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
                throw new IllegalArgumentException("Current password is incorrect");
            }
            existingSalle.setMp(bCryptPasswordEncoder.encode(salleDeSport.getMp()));
        }
        // Email and etat are preserved (not updated unless explicitly provided)
        if (salleDeSport.getEmail() != null) {
            existingSalle.setEmail(salleDeSport.getEmail());
        }


        return salleDeSportService.modifierSalleDeSport(existingSalle);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.PUT)
    public SalleDeSport modifierSalleDeSport(@RequestBody SalleDeSport salleDeSport, @PathVariable("id") Long id) {
        SalleDeSport newSalleDeSport = null;
        //HashMap<String, Object> response = new HashMap<>();
        if (salleDeSportRepository.findById(id).isPresent()) {
            SalleDeSport salleDeSport1 = salleDeSportRepository.findById(id).get();
            var salleId = salleDeSport.getId();
            var nom = salleDeSport.getNom();
            var email = salleDeSport.getEmail();
            var mp = salleDeSport.getMp();
            var tel = salleDeSport.getTelephone();
            var adresse = salleDeSport.getAdresse();
            salleDeSport.setId(salleId);
            salleDeSport.setNom(nom);
            salleDeSport.setEmail(email);
            salleDeSport.setMp(mp);
            salleDeSport.setTelephone(tel);
            salleDeSport.setAdresse(adresse);

            salleDeSport.setMp(this.bCryptPasswordEncoder.encode(salleDeSport1.getMp()));
            if (salleDeSport.isEtat() != salleDeSport1.isEtat()) {

              String etat = salleDeSport1.isEtat() ? "Bloqué" : "Accepté";
                emailSservice.SendSimpleMessage(salleDeSport1.getEmail(), "L'etat de votre compte", "votre compte a été " + etat);
            }
            salleDeSport1.setEtat(salleDeSport.isEtat());
            newSalleDeSport = salleDeSportRepository.save(salleDeSport1);
        }
        return newSalleDeSport;

               /* String etat = salleDeSport1.isEtat() ? "<strong ><span style=\"color: red;\">Bloqué</span>\n</strong>" : "<strong><span style=\"color: green;\">Accepté</span>\n</strong>";
                String loginLink = "";

                String logoImagePath = "cid:logoImage";
                String messageHTML =
                        "<!DOCTYPE html>" +
                                "<html>" +
                                "<head>" +
                                "<style>" +
                                ".card {" +
                                "   background-color: #f9f9f9;" +
                                "   border-radius: 10px;" +
                                "   padding: 20px;" +
                                "   margin: 20px auto;" +
                                "   width: 400px;" +
                                "   box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);" +
                                "}" +
                                ".logo {" +
                                "   text-align: center;" +
                                "   margin-bottom: 20px;" +
                                "}" +
                                ".logo img {" +
                                "   max-width: 200px;" +
                                "}" +
                                ".button {" +
                                "   display: block;" +
                                "   width: 200px;" +
                                "   margin: 0 auto;" +
                                "   padding: 10px 20px;" +
                                "   background-color: #b615ae;" +
                                "   color: white;" +
                                "   text-decoration: none;" +
                                "   text-align: center;" +
                                "   border-radius: 5px;" +
                                "   font-size: 16px;" +
                                "}" +
                                "</style>" +
                                "</head>" +
                                "<body>" +
                                "<div class=\"card\">" +
                                "<div class=\"logo\">" +
                                "<img src=\"cid:logoImage\" alt=\"Your Logo\">" +
                                "</div>" +
                                "<p> Salut <strong>" + salleDeSport.getNom() + "</strong>" +
                                "<h2>État de votre compte</h2>" +
                                "<h4>Votre compte a été " + etat + "</h4>";

                if (salleDeSport.isEtat()) { // If state is accepted
                    messageHTML += "<p>Cliquez ci-dessous pour revenir à la page de connexion :</p>\n" +
                            "<a href=\"http://localhost:4200/loginSalleDeSport\"><button class=button>Connexion</button></a>\n";
                }

                messageHTML += "</div>" +
                        "</body>" +
                        "</html>";

                MimeMessage message = emailSservice.createMimeMessage();
                MimeMessageHelper helper;
                try {
                    helper = new MimeMessageHelper(message, true);
                    helper.setTo(salleDeSport1.getEmail());
                    helper.setSubject("Acceptation inscription !");
                    helper.setText(messageHTML, true);
                    helper.addInline("logoImage", new ClassPathResource("static/images/logo-5.png"));
                    emailSservice.SendEmail(message);
                } catch (MessagingException e) {

                }

            }

            salleDeSport1.setEtat(salleDeSport.isEtat());


            newSalleDeSport = salleDeSportRepository.save(salleDeSport1);
            String token = Jwts.builder()
                    .claim("data", newSalleDeSport)
                    .signWith(SignatureAlgorithm.HS256, "SECRET")
                    .compact();

            response.put("salleDeSport", newSalleDeSport);
            response.put("token", token);
            System.out.println("ddddddddddddd");

            return ResponseEntity.status(HttpStatus.OK).body(response);

        } else {
            response.put("message", "Salle de sport not found !");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }*/
    }


    @GetMapping("/my-clients")
    public ResponseEntity<?> getMyClients(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

        try {
            // Decode the token
            Claims claims = Jwts.parser()
                    .setSigningKey("SECRET")
                    .parseClaimsJws(token)
                    .getBody();

            // Extract SalleDeSport ID from the "data" claim
            Map<String, Object> data = (Map<String, Object>) claims.get("data");
            Long salleId = ((Number) data.get("id")).longValue();

            // Verify SalleDeSport exists
            SalleDeSport salleDeSport = salleDeSportRepository.findById(salleId)
                    .orElseThrow(() -> new IllegalArgumentException("SalleDeSport not found"));

            // Fetch packs associated with this SalleDeSport
            List<Pack> packs = packRepository.findBySalleId(salleId);

            // Fetch subscriptions (Abonnement) linked to these packs
            List<Abonnement> abonnements = abonnementRepository.findByPackIn(packs);

            // Convert to DTO with client and subscription details
            List<ClientSubscriptionDTO> clientSubscriptions = abonnements.stream()
                    .filter(abonnement -> abonnement.getClient() != null)
                    .map(abonnement -> new ClientSubscriptionDTO(
                            abonnement.getClient().getId(),
                            abonnement.getClient().getNom(),
                            abonnement.getClient().getPrenom(),
                            abonnement.getClient().getEmail(),
                            abonnement.getClient().getTelephone(),
                            abonnement.getClient().getAge(),
                            abonnement.getPack().getNom(),
                            abonnement.getPaymentDate()
                    ))
                    .collect(Collectors.toList());

            return ResponseEntity.ok(clientSubscriptions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication error: " + e.getMessage());
        }
    }


    }

