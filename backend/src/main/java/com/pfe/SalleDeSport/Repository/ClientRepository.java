package com.pfe.SalleDeSport.Repository;

import com.pfe.SalleDeSport.Entity.Client;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClientRepository extends JpaRepository<Client, Long> {
    Client findByEmail(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select client from Client client where client.email = :email")
    Client findByEmailForUpdate(@Param("email") String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select client from Client client where client.id = :id")
    Client findByIdForUpdate(@Param("id") Long id);
}
