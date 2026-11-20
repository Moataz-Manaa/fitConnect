package com.pfe.SalleDeSport.RestController;

import org.springframework.security.access.prepost.PreAuthorize;
import com.pfe.SalleDeSport.Security.AccountAccess;
import com.pfe.SalleDeSport.Security.SessionTokens;
import com.pfe.SalleDeSport.Entity.Admin;
import com.pfe.SalleDeSport.Repository.AdminRepository;
import com.pfe.SalleDeSport.Service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping(value = "/admin")
public class AdminRestController {
    @Autowired
    private SessionTokens sessionTokens;

    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    @Autowired
    AdminRepository adminRepository;
    @Autowired
    AdminService adminService;

    @RequestMapping(method = RequestMethod.POST )
    @PreAuthorize("@accountAccess.isSuperAdmin(authentication)")
    ResponseEntity<?> AjouterAdmin (@RequestBody Admin admin){
        admin.setId(null);
        validateRole(admin.getRole());
        if (admin.getEmail() == null || admin.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        HashMap<String, Object> response = new HashMap<>();
        if(adminRepository.existsByEmail(admin.getEmail())){
            response.put("message", "email exist deja !");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }else{
            admin.setMp(this.bCryptPasswordEncoder.encode(admin.getMp()));
            Admin savedUser = adminRepository.save(admin);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);}
    }

    @RequestMapping(value = "/{id}" ,method = RequestMethod.PUT)
    @PreAuthorize("@accountAccess.isSuperAdmin(authentication)")
    public Admin modifieradmin(@PathVariable("id")Long id, @RequestBody Admin admin){
        validateRole(admin.getRole());
        if (admin.getEmail() == null || admin.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        Admin existing = adminRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        existing.setNom(admin.getNom());
        existing.setPrenom(admin.getPrenom());
        if (!admin.getEmail().equalsIgnoreCase(existing.getEmail()) && adminRepository.existsByEmail(admin.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }
        existing.setEmail(admin.getEmail());
        existing.setRole(admin.getRole());
        if (admin.getMp() != null && !admin.getMp().isBlank()) {
            existing.setMp(bCryptPasswordEncoder.encode(admin.getMp()));
        }
        return adminService.modifierAdmin(existing);
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE )
    @PreAuthorize("@accountAccess.isSuperAdmin(authentication)")
    public void suppAdmin(@PathVariable("id") Long id){
        adminService.supprimerAdmin(id);
    }

    @RequestMapping(method = RequestMethod.GET )
    public List<Admin> afficherAdmin(){
        return adminService.afficherAdmin();
    }

    private void validateRole(String role) {
        if (!AccountAccess.SUPER_ADMIN.equals(role) && !"Sous Administrateur".equals(role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid administrator role");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginAdmin(@RequestBody Admin admin) {
        Admin account = admin.getEmail() == null ? null : adminRepository.findAdminByEmail(admin.getEmail());
        if (account == null || admin.getMp() == null || !bCryptPasswordEncoder.matches(admin.getMp(), account.getMp())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Identifiants invalides"));
        }
        String token = sessionTokens.issue("admin", account.getId(), account.getPrenom(), account.getNom());
        return ResponseEntity.ok(Map.of("token", token, "role", account.getRole() == null ? "" : account.getRole()));
    }

    @RequestMapping(value = "/{id}" , method = RequestMethod.GET)
    public Optional<Admin> getAdminById(@PathVariable("id") Long id){
        Optional<Admin> admin = adminService.afficherAdminById(id);
        return admin;
    }

}