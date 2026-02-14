package com.pfe.SalleDeSport.Repository;

import com.pfe.SalleDeSport.Entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository  extends JpaRepository<Admin, Long> {
    boolean existsByEmail(String email);
    Admin findAdminByEmail(String email);
}
