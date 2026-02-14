package com.pfe.SalleDeSport.Service;

import jakarta.mail.internet.MimeMessage;

public interface EmailSservice {
    public void SendSimpleMessage(String to,String subject,String text);

  public   void SendEmail(MimeMessage message);

   public MimeMessage createMimeMessage();
}
