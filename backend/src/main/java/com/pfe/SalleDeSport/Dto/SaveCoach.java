package com.pfe.SalleDeSport.Dto;

import com.pfe.SalleDeSport.Entity.CoachSalle;
import jakarta.persistence.Column;
import jakarta.persistence.Lob;

public class SaveCoach {
    private Long id;
    private String nom;
    private String prenom;
    private String activity;
    private int age;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String image;
    private Long idSalle;

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

    public Long getIdSalle() {
        return idSalle;
    }

    public void setIdSalle(Long idSalle) {
        this.idSalle = idSalle;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getActivity() {
        return activity;
    }

    public void setActivity(String activity) {
        this.activity = activity;
    }

    public static CoachSalle toEntity(SaveCoach model){
        if(model == null){
            return null;
        }
        CoachSalle coachSalle = new CoachSalle();
        coachSalle.setId(model.getId());
        coachSalle.setNom(model.getNom());
        coachSalle.setPrenom(model.getPrenom());
        coachSalle.setAge(model.getAge());
        coachSalle.setImage(model.getImage());
        coachSalle.setActivity(model.getActivity());

        return coachSalle;
    }
}
