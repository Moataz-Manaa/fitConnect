package com.pfe.SalleDeSport.Repository;

import com.pfe.SalleDeSport.Entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
