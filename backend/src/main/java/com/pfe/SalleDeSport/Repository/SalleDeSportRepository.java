package com.pfe.SalleDeSport.Repository;

import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Entity.SalleDeSport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SalleDeSportRepository extends JpaRepository<SalleDeSport, Long> {
    boolean existsByEmail(String email);
    SalleDeSport findByEmail(String email);
    long countByEtat(boolean etat);

}
