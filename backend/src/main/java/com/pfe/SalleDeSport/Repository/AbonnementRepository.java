package com.pfe.SalleDeSport.Repository;


import com.pfe.SalleDeSport.Entity.Abonnement;
import com.pfe.SalleDeSport.Entity.Admin;
import com.pfe.SalleDeSport.Entity.Pack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AbonnementRepository extends JpaRepository<Abonnement, Long> {
    List<Abonnement> findByClientId(Long id);
    List<Abonnement> findByPackIn(List<Pack> packs);

    @Query("SELECT a FROM Abonnement a WHERE a.pack.salle.id = :salleId AND YEAR(a.dateCreation) = :year")
    List<Abonnement> findBySalleIdAndYear(@Param("salleId") Long salleId, @Param("year") Integer year);

    List<Abonnement> findByClientIdAndPackId(Long idClient, Long idPack);

}
