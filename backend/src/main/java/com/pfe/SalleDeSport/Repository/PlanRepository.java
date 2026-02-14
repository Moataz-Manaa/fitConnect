package com.pfe.SalleDeSport.Repository;

import com.pfe.SalleDeSport.Entity.CoachSalle;
import com.pfe.SalleDeSport.Entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Date;
import java.util.List;

public interface PlanRepository extends JpaRepository<Plan, Long> {
    List<Plan> findByCoachId(Long id);
    boolean existsByDateAndDebutAndFinAndCoach_Id(Date date, String debut, String fin, Long idCoach);
}
