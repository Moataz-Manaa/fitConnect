package com.pfe.SalleDeSport.RestController;

import com.pfe.SalleDeSport.Entity.Abonnement;
import com.pfe.SalleDeSport.Dto.AbonnementRequest;
import com.pfe.SalleDeSport.Service.AbonnementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@CrossOrigin("*")
@RequestMapping(value = "/abonnement")
public class AbonnementRestController {
    @Autowired
    AbonnementService reservationPackService;

    @RequestMapping(method = RequestMethod.POST)
    public Abonnement ajouterReservation(@RequestBody AbonnementRequest reservationPackRq){
        System.out.println("reserverRq"+reservationPackRq);
        return reservationPackService.ajouterReservationPack(reservationPackRq);
    }

    @RequestMapping("get-all-by-id-Client/{id}")
    public List<Abonnement> listReservationByClient(@PathVariable Long id){
        return reservationPackService.GetPackByClient(id);
    }

    @RequestMapping(method = RequestMethod.GET )
    public List<Abonnement> afficherReservationPack(){
        return reservationPackService.listeReservationPack();
    }


    @RequestMapping(value = "get-all-by-id-Client/{id}", method = RequestMethod.GET)
    public List<Abonnement> getAbonnementsByClientId(@PathVariable Long id) {
        return reservationPackService.getAbonnementsByClientId(id);
    }

    @PostMapping("/renouveler")
    public ResponseEntity<?> renouvelerAbonnement(@RequestBody AbonnementRequest renewalRequest) {
        try {
            // Validate the request
            if (renewalRequest.getIdClient() == null || renewalRequest.getIdPack() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Client ID and Pack ID are required"));
            }

          /*  if (renewalRequest.getPrix() == null || renewalRequest.getPrix() <= 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Valid price is required"));
            }*/

            // Process the renewal using the same method as regular reservations
            // The service layer will handle the renewal logic (setting correct activation date)
            Abonnement renewedAbonnement = reservationPackService.ajouterReservationPack(renewalRequest);

            if (renewedAbonnement != null) {
                // Return the renewed subscription with success message
                Map<String, Object> response = new HashMap<>();
                response.put("id", renewedAbonnement.getId());
                response.put("message", "Abonnement renouvelé avec succès");
                response.put("abonnement", renewedAbonnement);
                response.put("dateActivation", renewedAbonnement.getDateActivation());
                response.put("etat", renewedAbonnement.getEtat());

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Erreur lors du renouvellement de l'abonnement"));
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur serveur lors du renouvellement: " + e.getMessage()));
        }
    }

    /**
     * Optional: Get renewal preview (calculate dates without saving)
     */
    @GetMapping("/renewal-preview/{clientId}/{packId}")
    public ResponseEntity<?> getRenewalPreview(@PathVariable Long clientId, @PathVariable Long packId) {
        try {
            // Get current active subscription for this client and pack
            List<Abonnement> existingAbonnements = reservationPackService.getAbonnementsByClientId(clientId)
                    .stream()
                    .filter(ab -> ab.getPack().getId().equals(packId))
                    .collect(Collectors.toList());

            if (existingAbonnements.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Aucun abonnement actuel trouvé pour ce pack"));
            }

            // Find the latest expiry date
            Date latestExpiryDate = existingAbonnements.stream()
                    .map(ab -> {
                        Calendar cal = Calendar.getInstance();
                        cal.setTime(ab.getDateActivation());
                        cal.add(Calendar.DAY_OF_MONTH, 30);
                        return cal.getTime();
                    })
                    .max(Date::compareTo)
                    .orElse(new Date());

            // Calculate new expiry date (30 days from renewal start)
            Calendar newExpiryCal = Calendar.getInstance();
            newExpiryCal.setTime(latestExpiryDate);
            newExpiryCal.add(Calendar.DAY_OF_MONTH, 30);

            Map<String, Object> preview = new HashMap<>();
            preview.put("currentExpiryDate", latestExpiryDate);
            preview.put("renewalStartDate", latestExpiryDate);
            preview.put("renewalEndDate", newExpiryCal.getTime());

            return ResponseEntity.ok(preview);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors du calcul de l'aperçu: " + e.getMessage()));
        }
    }
}
