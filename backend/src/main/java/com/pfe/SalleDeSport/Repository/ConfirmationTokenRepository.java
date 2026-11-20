package com.pfe.SalleDeSport.Repository;

import com.pfe.SalleDeSport.Entity.ConfirmationToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfirmationTokenRepository extends JpaRepository<ConfirmationToken, Long> {
    void deleteByClientId(Long clientId);
    ConfirmationToken findByConfirmationToken(String confirmationToken);
}
