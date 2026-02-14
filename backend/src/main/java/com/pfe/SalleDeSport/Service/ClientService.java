package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Dto.ClientEditProfileRequest;
import com.pfe.SalleDeSport.Entity.Admin;
import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Entity.Contact;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ClientService {
    ResponseEntity<Object> ajouterClient(Client client);
    List<Client> afficherClient();
    void supprimerClient(Long id);
    Client modifierClient(Client client);
    ResponseEntity<?> forgotPassword(String email);
    ResponseEntity<?> resetPassword(String token, String newPassword);
    ResponseEntity<?> ConfirmeEmail(String confirmationToken);
    Optional<Client> afficherClientById(Long id);

}
