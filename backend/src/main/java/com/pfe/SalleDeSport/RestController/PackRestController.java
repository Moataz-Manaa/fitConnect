package com.pfe.SalleDeSport.RestController;

import com.pfe.SalleDeSport.Dto.SavePack;
import com.pfe.SalleDeSport.Entity.*;
import com.pfe.SalleDeSport.Repository.PackRepository;
import com.pfe.SalleDeSport.Service.PackService;
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
@RequestMapping(value = "/pack")
public class PackRestController {
    @Autowired
    PackService packService;
    @Autowired
    PackRepository packRepository;

    @RequestMapping(method = RequestMethod.GET)
    public List<Pack> afficherPack() {
        return packService.afficherPack();
    }

    @RequestMapping(method = RequestMethod.POST)
    public Pack ajouterPack(@RequestBody SavePack model) {
        return packService.ajouterPack(model);
    }

    @GetMapping("/my-packs")
    public ResponseEntity<List<Pack>> getMyPacks(@RequestHeader("Authorization") String authHeader) {
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
            List<Pack> packs = packService.afficherPacksBySalleId(salleId);
            return ResponseEntity.ok(packs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePack(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;

        try {
            Claims claims = Jwts.parser()
                    .setSigningKey("SECRET")
                    .parseClaimsJws(token)
                    .getBody();

            Map<String, Object> data = (Map<String, Object>) claims.get("data");
            Long salleId = ((Number) data.get("id")).longValue();

            Optional<Pack> packOpt = packRepository.findById(id);
            if (!packOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Pack not found");
            }

            Pack pack = packOpt.get();

            if (!pack.getSalle().getId().equals(salleId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not authorized to delete this pack");
            }

            // Delete the pack
            packService.supprimerPack(id);
            return ResponseEntity.ok("Pack deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication error");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pack> updatePack(@PathVariable Long id, @RequestBody SavePack model) {
        return ResponseEntity.ok(packService.modifierPack(model, id));
    }

    @RequestMapping(value = "/{id}" , method = RequestMethod.GET)
    public Optional<Pack> getPackById(@PathVariable("id") Long id){
        Optional<Pack> pack = packService.GetPackById(id);
        return pack;
    }

    @GetMapping("/get-id/{id}")
    public Pack getById(@PathVariable Long id)
    {
        return packService.getById(id);
    }

    @GetMapping("/salle/{id}")
    public List<Pack> afficherPackBySalle(@PathVariable Long id) {
        return packService.afficherPacksBySalleId(id);
    }

}