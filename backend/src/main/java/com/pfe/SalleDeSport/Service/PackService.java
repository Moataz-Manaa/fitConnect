package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Pack;
import com.pfe.SalleDeSport.Dto.SavePack;

import java.util.List;
import java.util.Optional;

public interface PackService {
    Pack ajouterPack(SavePack model);
    List<Pack> afficherPack();
    List<Pack> afficherPacksBySalleId(Long salleId);
    void supprimerPack(Long id);
    Pack modifierPack(SavePack model, Long id);

    Optional<Pack> GetPackById(Long id);
    Pack getById(Long id);

}
