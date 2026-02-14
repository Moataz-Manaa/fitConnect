package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Admin;
import com.pfe.SalleDeSport.Entity.Contact;

import java.util.List;

public interface ContactService {
    Contact ajouterContact(Contact contact);
    List<Contact> afficherContact();
    void supprimerContact(Long id);
}
