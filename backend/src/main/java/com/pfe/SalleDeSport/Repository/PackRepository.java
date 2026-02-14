package com.pfe.SalleDeSport.Repository;

import com.pfe.SalleDeSport.Entity.Contact;
import com.pfe.SalleDeSport.Entity.Pack;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PackRepository extends JpaRepository<Pack, Long> {
    List<Pack> findBySalleId(Long salleId);
}
