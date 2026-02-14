package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Contact;
import com.pfe.SalleDeSport.Repository.ContactRepository;
import com.pusher.rest.Pusher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ContactServiceImpl implements ContactService {
    @Autowired
    private ContactRepository contactRepository;



    @Override
    public Contact ajouterContact(Contact contact) {
        Contact saved = contactRepository.save(contact);
        return saved;
    }

    @Override
    public List<Contact> afficherContact() {
        return contactRepository.findAll();
    }

    @Override
    public void supprimerContact(Long id) {
        contactRepository.deleteById(id);
    }
}