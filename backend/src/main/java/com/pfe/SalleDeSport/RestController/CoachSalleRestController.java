package com.pfe.SalleDeSport.RestController;

import com.pfe.SalleDeSport.Dto.SaveCoach;
import com.pfe.SalleDeSport.Entity.*;
import com.pfe.SalleDeSport.Service.CoachSalleService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin("*")
@RequestMapping(value = "/coachSalle")
public class CoachSalleRestController {
    @Autowired
    CoachSalleService coachSalleService;

    @RequestMapping(method = RequestMethod.POST)
    public CoachSalle AjouterCoachSalle (@RequestBody SaveCoach coach){
        return coachSalleService.ajouterCoach(coach);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE )
    public void suppCoach(@PathVariable("id") Long id){
        coachSalleService.supprimerCoach(id);
    }

    @RequestMapping(method = RequestMethod.GET )
    public List<CoachSalle> afficherCoach(){
        return coachSalleService.afficherCoach();
    }

    @RequestMapping(value = "/{id}",method = RequestMethod.GET )
    public Optional<CoachSalle> afficherCoachById(@PathVariable("id") Long id){
        return coachSalleService.afficherCoachById(id);
    }

    @GetMapping("/my-coach")
    public ResponseEntity<List<CoachSalle>> getMyCoachs(@RequestHeader("Authorization") String authHeader) {
        // Remove "Bearer " prefix if present
        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

        try {
            // Decode the token
            Claims claims = Jwts.parser()
                    .setSigningKey("SECRET") // Use the same secret as in login
                    .parseClaimsJws(token)
                    .getBody();

            // Extract SalleDeSport from the "data" claim
            Map<String, Object> data = (Map<String, Object>) claims.get("data");
            Long salleId = ((Number) data.get("id")).longValue(); // Cast to Long

            // Fetch packs for this SalleDeSport
            List<CoachSalle> coachs = coachSalleService.afficherCoachBySalleId(salleId);
            return ResponseEntity.ok(coachs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CoachSalle> updateCoach(@PathVariable Long id, @RequestBody SaveCoach model) {
        return ResponseEntity.ok(coachSalleService.modifierCoach(model, id));
    }

    @GetMapping("/salle/{id}")
    public List<CoachSalle> afficherCoachBySalle(@PathVariable Long id) {
        return coachSalleService.afficherCoachBySalleId(id);
    }


}
