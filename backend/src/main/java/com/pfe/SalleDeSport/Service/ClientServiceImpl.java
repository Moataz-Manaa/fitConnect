package com.pfe.SalleDeSport.Service;


import com.pfe.SalleDeSport.Dto.ClientEditProfileRequest;
import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Entity.Coach;
import com.pfe.SalleDeSport.Entity.ConfirmationToken;
import com.pfe.SalleDeSport.Entity.PasswordResetToken;
import com.pfe.SalleDeSport.Repository.ClientRepository;
import com.pfe.SalleDeSport.Repository.ConfirmationTokenRepository;
import com.pfe.SalleDeSport.Repository.PasswordResetTokenRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ClientServiceImpl implements ClientService{

    private BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    @Autowired
    ClientRepository clientRepository;
    @Autowired
    ConfirmationTokenRepository confirmationTokenRepository;
    @Autowired
    EmailService emailService;
    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;


    @Override
    public ResponseEntity<Object>  ajouterClient(Client client) {
        Client existingUser = clientRepository.findByEmail(client.getEmail());
        if (existingUser!=null) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }
        client.setMp(this.bCryptPasswordEncoder.encode(client.getMp()));
        clientRepository.save(client);
        ConfirmationToken confirmationToken = new ConfirmationToken(client);
        confirmationTokenRepository.save(confirmationToken);
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom("manaamoataz@gmail.com");
        mailMessage.setTo(client.getEmail());
        mailMessage.setSubject("Complete Registration!");
        mailMessage.setText("To confirm your account, please click here : "
                +"http://localhost:8081/api/client/confirm-account?token="+confirmationToken.getConfirmationToken());
        emailService.sendEmail(mailMessage);
        System.out.println("Confirmation Token: " + confirmationToken.getConfirmationToken());
        return ResponseEntity.ok("Verify email by the link sent on your email address");
    }

    @Override
    public ResponseEntity<?> ConfirmeEmail(String confirmationToken) {

        ConfirmationToken token = confirmationTokenRepository.findByConfirmationToken(confirmationToken);

        if(token != null)
        {
            Client client = clientRepository.findByEmail(token.getClient().getEmail());
            System.out.println("email from token " +token.getClient().getEmail());
            client.setEtat(true);
            clientRepository.save(client);
            return ResponseEntity.ok("Email verified successfully!");
        }else {
            return ResponseEntity.badRequest().body("Error: Couldn't verify email");}
    }

    @Override
    public List<Client> afficherClient() {
        return clientRepository.findAll();
    }

    @Override
    public void supprimerClient(Long id) {
        clientRepository.deleteById(id);
    }

    @Override
    public Client modifierClient(Client client) {
        return clientRepository.save(client);
    }


    @Override
    public ResponseEntity<?> forgotPassword(String email) {
        Client client = clientRepository.findByEmail(email);

        if (client == null) {
            return ResponseEntity.badRequest().body("Aucun utilisateur trouvé avec cet email");
        }

        PasswordResetToken resetToken = new PasswordResetToken(client);
        passwordResetTokenRepository.save(resetToken);

        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom("manaamoataz@gmail.com");
        mailMessage.setTo(client.getEmail());
        mailMessage.setSubject("Password Reset Request");
        mailMessage.setText("To reset your password, please click here: "
                + "http://localhost:4200/reset-password?token=" + resetToken.getToken());

        emailService.sendEmail(mailMessage);

        return ResponseEntity.ok("Le lien de réinitialisation du mot de passe a été envoyé à votre adresse e-mail");
    }

    @Override
    public ResponseEntity<?> resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token);

        if (resetToken == null) {
            return ResponseEntity.badRequest().body("Invalid token");
        }

        if (resetToken.getExpiryDate().before(new Date())) {
            return ResponseEntity.badRequest().body("Token has expired");
        }

        Client client = resetToken.getClient();
        client.setMp(bCryptPasswordEncoder.encode(newPassword));
        clientRepository.save(client);

        passwordResetTokenRepository.delete(resetToken);

        return ResponseEntity.ok("Le mot de passe a été réinitialisé avec succès");
    }


    @Override
    public Optional<Client> afficherClientById(Long id) {
        return clientRepository.findById(id);
    }


}
