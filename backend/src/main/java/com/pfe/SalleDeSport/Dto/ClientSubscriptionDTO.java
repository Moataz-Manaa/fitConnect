package com.pfe.SalleDeSport.Dto;

import java.util.Date;

public class ClientSubscriptionDTO {
    private Long clientId;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private int age;
    private String packNom;
    private Date dateCreation;

    public ClientSubscriptionDTO(Long clientId, String nom, String prenom, String email,
                                 String telephone, int age, String packNom, Date dateCreation) {
        this.clientId = clientId;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.telephone = telephone;
        this.age = age;
        this.packNom = packNom;
        this.dateCreation = dateCreation;
    }

    // Getters and setters
    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getPackNom() {
        return packNom;
    }

    public void setPackNom(String packNom) {
        this.packNom = packNom;
    }

    public Date getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(Date dateCreation) {
        this.dateCreation = dateCreation;
    }
}
