package com.pfe.SalleDeSport.Service;

import org.springframework.mail.SimpleMailMessage;

public interface EmailService {
    void sendEmail(SimpleMailMessage email) ;
}
