package com.pfe.SalleDeSport.RestController;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.access.prepost.PreAuthorize;
import com.pfe.SalleDeSport.Dto.SavePack;
import com.pfe.SalleDeSport.Entity.*;
import com.pfe.SalleDeSport.Service.PackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping(value = "/pack")
public class PackRestController {
    @Autowired
    PackService packService;

    @RequestMapping(method = RequestMethod.GET)
    public List<Pack> afficherPack() {
        return packService.afficherPack();
    }

    @RequestMapping(method = RequestMethod.POST)
    @PreAuthorize("#model.id == null and @accountAccess.ownsAccount(authentication, #model.idSalle)")
    public Pack ajouterPack(@RequestBody SavePack model) {
        return packService.ajouterPack(model);
    }

    @GetMapping("/my-packs")
    public List<Pack> getMyPacks(@AuthenticationPrincipal Jwt jwt) {
        return packService.afficherPacksBySalleId(Long.valueOf(jwt.getSubject()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@accountAccess.ownsPack(authentication, #id)")
    public ResponseEntity<String> deletePack(@PathVariable Long id) {
        packService.supprimerPack(id);
        return ResponseEntity.ok("Pack deleted successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("@accountAccess.ownsPack(authentication, #id) and @accountAccess.ownsAccount(authentication, #model.idSalle)")
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