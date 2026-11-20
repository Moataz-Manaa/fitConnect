package com.pfe.SalleDeSport.Security;

import com.pfe.SalleDeSport.Entity.Admin;
import com.pfe.SalleDeSport.Repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class FirstAdmin {
    @Bean
    ApplicationRunner initializeFirstAdmin(AdminRepository admins,
            @Value("${FITCONNECT_FIRST_ADMIN_EMAIL:}") String email,
            @Value("${FITCONNECT_FIRST_ADMIN_PASSWORD:}") String password) {
        return args -> {
            if (admins.count() != 0 || (email.isBlank() && password.isBlank())) {
                return;
            }
            if (email.isBlank() || password.length() < 12) {
                throw new IllegalStateException("The initial admin requires an email and a password of at least 12 characters");
            }
            Admin admin = new Admin();
            admin.setEmail(email);
            admin.setNom("Admin");
            admin.setRole(AccountAccess.SUPER_ADMIN);
            admin.setMp(new BCryptPasswordEncoder().encode(password));
            admins.save(admin);
        };
    }
}
