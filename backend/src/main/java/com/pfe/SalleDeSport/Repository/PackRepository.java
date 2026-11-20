package com.pfe.SalleDeSport.Repository;

import com.pfe.SalleDeSport.Entity.Contact;
import com.pfe.SalleDeSport.Entity.Pack;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

import java.util.List;

public interface PackRepository extends JpaRepository<Pack, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select item from Pack item where item.id = :id")
    Optional<Pack> findByIdForUpdate(@Param("id") Long id);

    List<Pack> findBySalleId(Long salleId);
}
