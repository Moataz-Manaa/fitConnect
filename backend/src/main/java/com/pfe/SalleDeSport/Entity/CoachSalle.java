package com.pfe.SalleDeSport.Entity;

import jakarta.persistence.*;

@Entity
public class CoachSalle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private String prenom;
    private int age;
    private String activity;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String image;
    @ManyToOne
    @JoinColumn(name = "salle_de_sport_id")
    private SalleDeSport salleDeSport;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getActivity() {
        return activity;
    }

    public void setActivity(String activity) {
        this.activity = activity;
    }

    public SalleDeSport getSalleDeSport() {
        return salleDeSport;
    }

    public void setSalleDeSport(SalleDeSport salleDeSport) {
        this.salleDeSport = salleDeSport;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}