package com.pfe.SalleDeSport.Repository;

import com.pfe.SalleDeSport.Entity.Coach;
import com.pfe.SalleDeSport.Entity.SalleDeSport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CoachRepository extends JpaRepository<Coach, Long> {
    boolean existsByEmail(String email);
    Coach findByEmail(String email);

}
