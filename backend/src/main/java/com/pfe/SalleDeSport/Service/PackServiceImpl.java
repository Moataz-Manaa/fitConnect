package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Dto.SavePack;
import com.pfe.SalleDeSport.Entity.*;
import com.pfe.SalleDeSport.Repository.CategoryRepository;
import com.pfe.SalleDeSport.Repository.PackRepository;
import com.pfe.SalleDeSport.Repository.SalleDeSportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PackServiceImpl implements PackService{

    @Autowired
    PackRepository packRepository;
    @Autowired
    CategoryRepository categoryRepository;
    @Autowired
    SalleDeSportRepository salleDeSportRepository;

    @Override
    public Pack ajouterPack(SavePack model) {
        Pack pack = SavePack.toEntity(model);
        Category category = categoryRepository.findById(model.getIdCategory()).get();
        pack.setCategory(category);
        SalleDeSport salleDeSport = salleDeSportRepository.findById(model.getIdSalle()).get();
        pack.setSalle(salleDeSport);

        return packRepository.save(pack);
    }

    @Override
    public List<Pack> afficherPack() {
        return packRepository.findAll();
    }

    @Override
    public List<Pack> afficherPacksBySalleId(Long salleId) {
        return packRepository.findBySalleId(salleId);
    }

    @Override
    public void supprimerPack(Long id) {
        packRepository.deleteById(id);
    }

    @Override
    public Pack modifierPack(SavePack model, Long id) {
        Optional<Pack> optionalPack = packRepository.findById(id);
        if (!optionalPack.isPresent()) {
            throw new RuntimeException("Pack not found");
        }

        Pack pack = optionalPack.get();
        pack.setNom(model.getNom());
        pack.setPrix(model.getPrix());
        pack.setDescription(model.getDescription());

        if (model.getImage() != null && !model.getImage().isEmpty()) {
            pack.setImage(model.getImage());
        }

        Category category = categoryRepository.findById(model.getIdCategory())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        pack.setCategory(category);

        SalleDeSport salle = salleDeSportRepository.findById(model.getIdSalle())
                .orElseThrow(() -> new RuntimeException("Salle not found"));
        pack.setSalle(salle);

        return packRepository.save(pack);
    }

    @Override
    public Optional<Pack> GetPackById(Long id) {
        return packRepository.findById(id);
    }

    @Override
    public Pack getById(Long id) {
        return packRepository.findById(id).get();
    }


}
