package com.pfe.SalleDeSport.Repository;

import com.pfe.SalleDeSport.Entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends JpaRepository<Contact, Long> {
}
