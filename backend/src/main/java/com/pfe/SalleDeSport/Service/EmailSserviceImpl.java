package com.pfe.SalleDeSport.Service;


import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class EmailSserviceImpl implements EmailSservice{
    @Autowired
    private JavaMailSender emailSender;
    @Override
    public void SendSimpleMessage(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("noreply@baeldung.com");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        try {
            emailSender.send(message);
        } catch (MailException e) {

        }
    }


    public MimeMessage createMimeMessage(){
        return emailSender.createMimeMessage();
    }
    public void SendEmail(MimeMessage message) {
        emailSender.send(message);
    }
}
