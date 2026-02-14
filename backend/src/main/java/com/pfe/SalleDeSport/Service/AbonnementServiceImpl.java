package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Dto.AbonnementRequest;
import com.pfe.SalleDeSport.Entity.*;
import com.pfe.SalleDeSport.Repository.AbonnementRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class AbonnementServiceImpl implements AbonnementService {
    @Autowired
    AbonnementRepository abonnementRepository;
    @Autowired
    PackService packService;
    @Autowired
    ClientService clientService;

    @Override
    @Transactional
    public Abonnement ajouterReservationPack(AbonnementRequest reservationPackRq) {
        Optional<Pack> pack = packService.GetPackById(reservationPackRq.getIdPack());
        Optional<Client> client = clientService.afficherClientById(reservationPackRq.getIdClient());

        if (pack.isPresent() && client.isPresent()) {
            Abonnement abonnement = new Abonnement();
            abonnement.setPack(pack.get());
            abonnement.setClient(client.get());
            abonnement.setPrix(reservationPackRq.getPrix());
            abonnement.setDateCreation(new Date()); // Set creation date to now
            abonnement.setPaymentDate(reservationPackRq.getPaymentDate() != null
                    ? reservationPackRq.getPaymentDate()
                    : new Date());
            abonnement.setDateActivation(reservationPackRq.getDateActivation() != null
                    ? reservationPackRq.getDateActivation()
                    : new Date());
            abonnement.setEtat("actif");

            return abonnementRepository.save(abonnement);
        } else {
            return null;
        }
    }


    @Override
    @Transactional
    public Abonnement renouvelerAbonnement(AbonnementRequest renewalRequest) {
        Optional<Pack> pack = packService.GetPackById(renewalRequest.getIdPack());
        Optional<Client> client = clientService.afficherClientById(renewalRequest.getIdClient());

        if (pack.isPresent() && client.isPresent()) {
            // Check if client has an existing active subscription for this pack
            List<Abonnement> existingAbonnements = abonnementRepository
                    .findByClientIdAndPackId(renewalRequest.getIdClient(), renewalRequest.getIdPack());

            Date newActivationDate = renewalRequest.getDateActivation();

            // If there are existing subscriptions, ensure the new one starts after the latest expiry
            if (!existingAbonnements.isEmpty()) {
                Date latestExpiryDate = getLatestExpiryDate(existingAbonnements);
                if (newActivationDate.before(latestExpiryDate)) {
                    newActivationDate = latestExpiryDate;
                }
            }

            Abonnement renewalAbonnement = new Abonnement();
            renewalAbonnement.setPack(pack.get());
            renewalAbonnement.setClient(client.get());
            renewalAbonnement.setPrix(renewalRequest.getPrix());
            renewalAbonnement.setDateCreation(new Date());
            renewalAbonnement.setPaymentDate(renewalRequest.getPaymentDate() != null
                    ? renewalRequest.getPaymentDate()
                    : new Date());
            renewalAbonnement.setDateActivation(newActivationDate);

            // Set etat based on activation date
            Date currentDate = new Date();
            if (newActivationDate.after(currentDate)) {
                renewalAbonnement.setEtat("en_attente"); // Waiting to be activated
            } else {
                renewalAbonnement.setEtat("actif");
            }

            return abonnementRepository.save(renewalAbonnement);
        } else {
            return null;
        }
    }


    private Date getLatestExpiryDate(List<Abonnement> abonnements) {
        Date latestExpiry = new Date(0); // Start with epoch time

        for (Abonnement abonnement : abonnements) {
            Date expiryDate = calculateExpiryDate(abonnement.getDateActivation());
            if (expiryDate.after(latestExpiry)) {
                latestExpiry = expiryDate;
            }
        }

        return latestExpiry;
    }

    /**
     * Calculate expiry date (30 days from activation)
     */
    private Date calculateExpiryDate(Date activationDate) {
        if (activationDate == null) return new Date();

        Calendar calendar = Calendar.getInstance();
        calendar.setTime(activationDate);
        calendar.add(Calendar.DAY_OF_MONTH, 30);
        return calendar.getTime();
    }

    @Override
    public List<Abonnement> listeReservationPack() {
        List<Abonnement> abonnements = abonnementRepository.findAll();
        updateAbonnementsEtat(abonnements);
        return abonnements;
    }

    @Override
    public List<Abonnement> GetPackByClient(Long id) {
        List<Abonnement> abonnements = abonnementRepository.findByClientId(id);
        updateAbonnementsEtat(abonnements);
        return abonnements;
    }

    @Override
    public List<Abonnement> getAbonnementsByClientId(Long id) {
        List<Abonnement> abonnements = abonnementRepository.findByClientId(id);
        updateAbonnementsEtat(abonnements);
        return abonnements;
    }

    // Update etat for a list of abonnements
    private void updateAbonnementsEtat(List<Abonnement> abonnements) {
        for (Abonnement abonnement : abonnements) {
            updateAbonnementEtat(abonnement);
            abonnementRepository.save(abonnement);
        }
    }

    // Compute etat for a single abonnement based on dateActivation + 30 days
    private void updateAbonnementEtat(Abonnement abonnement) {
        if (abonnement.getDateActivation() == null) {
            abonnement.setEtat("inactif");
            return;
        }

        Date currentDate = new Date();
        Date activationDate = abonnement.getDateActivation();
        Date expiryDate = calculateExpiryDate(activationDate);

        // Determine etat based on current date, activation date, and expiry date
        if (currentDate.before(activationDate)) {
            abonnement.setEtat("en_attente"); // Subscription not yet started
        } else if (currentDate.after(expiryDate)) {
            abonnement.setEtat("inactif"); // Subscription expired
        } else {
            abonnement.setEtat("actif"); // Subscription is currently active
        }
    }

    // Optional: Add method to get a single abonnement by ID with updated etat
    public Optional<Abonnement> getAbonnementById(Long id) {
        Optional<Abonnement> abonnement = abonnementRepository.findById(id);
        abonnement.ifPresent(this::updateAbonnementEtat);
        abonnement.ifPresent(abonnementRepository::save);
        return abonnement;
    }


}