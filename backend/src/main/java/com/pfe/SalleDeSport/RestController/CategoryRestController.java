package com.pfe.SalleDeSport.RestController;

import com.pfe.SalleDeSport.Entity.Category;
import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/category")
public class CategoryRestController {

    @Autowired
    CategoryService categoryService;

    @RequestMapping(method = RequestMethod.POST)
    public Category AjouterCategory(@RequestBody Category category) {
        return categoryService.ajouterCategory(category);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE )
    public void suppCategory(@PathVariable("id") Long id){
        categoryService.supprimerCategory(id);
    }

    @RequestMapping(method = RequestMethod.GET )
    public List<Category> afficherCategory(){
        return categoryService.afficherCategory();
    }
}
