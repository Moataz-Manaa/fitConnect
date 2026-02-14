package com.pfe.SalleDeSport.Repository;

import com.pfe.SalleDeSport.Entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long> {
    Client findByEmail(String email);
}
