package com.pfe.SalleDeSport.Dto;

public class ClientEditProfileRequest {
    private String nom;
    private String prenom;
    private int age;
    private String telephone;
    private String mp;

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getMp() { return mp; }
    public void setMp(String mp) { this.mp = mp; }
}