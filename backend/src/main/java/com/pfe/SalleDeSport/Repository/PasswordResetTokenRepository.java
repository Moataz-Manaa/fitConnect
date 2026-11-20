package com.pfe.SalleDeSport.Repository;

import com.pfe.SalleDeSport.Entity.PasswordResetToken;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    PasswordResetToken findByClientId(Long clientId);
    void deleteByClientId(Long clientId);

    @Query("select reset.client.id from PasswordResetToken reset where reset.token = :token")
    Long findClientIdByToken(@Param("token") String token);
}