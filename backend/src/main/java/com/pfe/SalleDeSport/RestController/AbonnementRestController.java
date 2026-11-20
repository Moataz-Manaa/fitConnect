package com.pfe.SalleDeSport.RestController;

import com.pfe.SalleDeSport.Entity.Abonnement;
import com.pfe.SalleDeSport.Service.AbonnementService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/abonnement")
public class AbonnementRestController {
    private final AbonnementService subscriptions;

    public AbonnementRestController(AbonnementService subscriptions) {
        this.subscriptions = subscriptions;
    }

    @GetMapping
    public List<Abonnement> afficherReservationPack() {
        return subscriptions.listeReservationPack();
    }

    @GetMapping("/get-all-by-id-Client/{id}")
    @PreAuthorize("@accountAccess.ownsAccount(authentication, #id)")
    public List<Abonnement> getAbonnementsByClientId(@PathVariable Long id) {
        return subscriptions.getAbonnementsByClientId(id);
    }
}
