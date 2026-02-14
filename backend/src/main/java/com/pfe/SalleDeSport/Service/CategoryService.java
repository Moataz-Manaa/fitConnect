package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Category;
import com.pfe.SalleDeSport.Entity.Client;

import java.util.List;

public interface CategoryService {
    Category ajouterCategory(Category category);
    List<Category> afficherCategory();
    void supprimerCategory(Long id);
    Category modifierCategory(Category category);
}
