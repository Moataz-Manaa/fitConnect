package com.pfe.SalleDeSport.Repository;


import com.pfe.SalleDeSport.Entity.Abonnement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AbonnementRepository extends JpaRepository<Abonnement, Long> {
    List<Abonnement> findByClientId(Long id);
    List<Abonnement> findByPackSalleId(Long id);

    @Query("SELECT a FROM Abonnement a WHERE a.pack.salle.id = :salleId AND YEAR(a.dateCreation) = :year")
    List<Abonnement> findBySalleIdAndYear(@Param("salleId") Long salleId, @Param("year") Integer year);

    List<Abonnement> findByClientIdAndPackId(Long idClient, Long idPack);
    boolean existsByClientIdAndPackId(Long clientId, Long packId);

}
