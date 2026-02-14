package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Category;
import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class CategoryServiceImpl implements CategoryService{


    @Autowired
    CategoryRepository categoryRepository;

    @Override
    public Category ajouterCategory(Category category) {
        return categoryRepository.save(category);
    }

    @Override
    public List<Category> afficherCategory() {
        return categoryRepository.findAll();
    }

    @Override
    public void supprimerCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    @Override
    public Category modifierCategory(Category category) {
        return categoryRepository.save(category);
    }
}
