package com.pfe.SalleDeSport.Repository;

import com.pfe.SalleDeSport.Entity.CoachSalle;
import com.pfe.SalleDeSport.Entity.Plan;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

import java.util.Date;
import java.util.List;

public interface PlanRepository extends JpaRepository<Plan, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select item from Plan item where item.id = :id")
    Optional<Plan> findByIdForUpdate(@Param("id") Long id);

    List<Plan> findByCoachId(Long id);
    boolean existsByDateAndDebutAndFinAndCoach_Id(Date date, String debut, String fin, Long idCoach);
}
