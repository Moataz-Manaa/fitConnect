package com.pfe.SalleDeSport.Dto;

import java.util.Date;

public record ClientSubscriptionDTO(Long clientId, String nom, String prenom, String email,
                                    String telephone, int age, String packNom, Date dateCreation,
                                    Date dateActivation, String etat) {}
