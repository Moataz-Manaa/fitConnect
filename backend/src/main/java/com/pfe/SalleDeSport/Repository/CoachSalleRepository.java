package com.pfe.SalleDeSport.Repository;

import com.pfe.SalleDeSport.Entity.CoachSalle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CoachSalleRepository extends JpaRepository<CoachSalle, Long> {
    List<CoachSalle> findBySalleDeSportId(Long salleId);
}
