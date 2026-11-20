package com.pfe.SalleDeSport.Service;


import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Entity.ConfirmationToken;
import com.pfe.SalleDeSport.Entity.PasswordResetToken;
import com.pfe.SalleDeSport.Entity.CheckoutPurchase.State;
import com.pfe.SalleDeSport.Repository.CheckoutPurchaseRepository;
import com.pfe.SalleDeSport.Repository.ClientRepository;
import com.pfe.SalleDeSport.Repository.ConfirmationTokenRepository;
import com.pfe.SalleDeSport.Repository.PasswordResetTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ClientServiceImpl implements ClientService{

    private static final Logger LOGGER = LoggerFactory.getLogger(ClientServiceImpl.class);
    private static final String RESET_RESPONSE = "Si un compte correspond, un lien de r\u00e9initialisation sera envoy\u00e9.";
    private final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    @Autowired
    ClientRepository clientRepository;
    @Autowired
    CheckoutPurchaseRepository purchases;
    @Autowired
    ConfirmationTokenRepository confirmationTokenRepository;
    @Autowired
    EmailService emailService;
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Value("${fitconnect.urls.api-base-url}")
    private String apiBaseUrl;
    @Value("${fitconnect.urls.frontend-base-url}")
    private String frontendBaseUrl;


    @Override
    public ResponseEntity<Object>  ajouterClient(Client client) {
        Client existingUser = clientRepository.findByEmail(client.getEmail());
        if (existingUser!=null) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }
        client.setId(null);
        client.setEtat(false);
        client.setMp(this.bCryptPasswordEncoder.encode(client.getMp()));
        clientRepository.save(client);
        ConfirmationToken confirmationToken = new ConfirmationToken(client);
        confirmationTokenRepository.save(confirmationToken);
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom("manaamoataz@gmail.com");
        mailMessage.setTo(client.getEmail());
        mailMessage.setSubject("Complete Registration!");
        mailMessage.setText("To confirm your account, please click here : "
                + apiBaseUrl + "/client/confirm-account?token=" + confirmationToken.getConfirmationToken());
        emailService.sendEmail(mailMessage);
        return ResponseEntity.ok("Verify email by the link sent on your email address");
    }

    @Override
    @Transactional
    public ResponseEntity<?> ConfirmeEmail(String confirmationToken) {
        ConfirmationToken token = confirmationTokenRepository.findByConfirmationToken(confirmationToken);
        if (token == null) {
            return ResponseEntity.badRequest().body("Error: Couldn't verify email");
        }
        token.getClient().setEtat(true);
        confirmationTokenRepository.delete(token);
        return ResponseEntity.ok("Email verified successfully!");
    }

    @Override
    public List<Client> afficherClient() {
        return clientRepository.findAll();
    }

    @Override
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void supprimerClient(Long id) {
        if (clientRepository.findByIdForUpdate(id) == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        if (purchases.existsByClientIdAndState(id, State.OPEN)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A checkout is still open for this client");
        }
        confirmationTokenRepository.deleteByClientId(id);
        passwordResetTokenRepository.deleteByClientId(id);
        clientRepository.deleteById(id);
    }

    @Override
    public Client modifierClient(Client client) {
        return clientRepository.save(client);
    }


    @Override
    @Transactional
    public ResponseEntity<?> forgotPassword(String email) {
        Client client = email == null || email.isBlank() ? null : clientRepository.findByEmailForUpdate(email);
        if (client == null || !client.isEtat()) {
            return ResponseEntity.ok(RESET_RESPONSE);
        }

        PasswordResetToken resetToken = new PasswordResetToken(client);
        PasswordResetToken previous = passwordResetTokenRepository.findByClientId(client.getId());
        if (previous != null) {
            previous.setToken(resetToken.getToken());
            previous.setExpiryDate(resetToken.getExpiryDate());
        } else {
            passwordResetTokenRepository.save(resetToken);
        }

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom("manaamoataz@gmail.com");
        mailMessage.setTo(client.getEmail());
        mailMessage.setSubject("Password Reset Request");
        mailMessage.setText("To reset your password, please click here: "
                + frontendBaseUrl + "/reset-password?token=" + resetToken.getToken());
        try {
            emailService.sendEmail(mailMessage);
        } catch (MailException failure) {
            LOGGER.warn("Could not send password reset email");
        }
        return ResponseEntity.ok(RESET_RESPONSE);
    }

    @Override
    @Transactional
    public ResponseEntity<?> resetPassword(String token, String newPassword) {
        Long clientId = passwordResetTokenRepository.findClientIdByToken(token);
        Client client = clientId == null ? null : clientRepository.findByIdForUpdate(clientId);
        if (client == null || !client.isEtat()) {
            return ResponseEntity.badRequest().body("Invalid token");
        }
        PasswordResetToken resetToken = passwordResetTokenRepository.findByClientId(clientId);

        if (resetToken == null || !resetToken.getToken().equals(token)) {
            return ResponseEntity.badRequest().body("Invalid token");
        }

        if (resetToken.getExpiryDate().before(new Date())) {
            return ResponseEntity.badRequest().body("Token has expired");
        }

        client.setMp(bCryptPasswordEncoder.encode(newPassword));
        passwordResetTokenRepository.delete(resetToken);

        return ResponseEntity.ok("Le mot de passe a été réinitialisé avec succès");
    }


    @Override
    public Optional<Client> afficherClientById(Long id) {
        return clientRepository.findById(id);
    }


}
