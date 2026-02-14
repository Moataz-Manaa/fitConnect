package com.pfe.SalleDeSport.Dto;

import com.pfe.SalleDeSport.Entity.Pack;
import jakarta.persistence.Column;
import jakarta.persistence.Lob;

public class SavePack {
    private Long id;
    private String nom;
    private Float prix;
    private String description;
    private Long idCategory;
    private Long idSalle;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String image;

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

    public Float getPrix() {
        return prix;
    }

    public void setPrix(Float prix) {
        this.prix = prix;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getIdCategory() {
        return idCategory;
    }

    public void setIdCategory(Long idCategory) {
        this.idCategory = idCategory;
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

    public static Pack toEntity(SavePack model){
        if(model == null){
            return null;
        }
        Pack pack = new Pack();
        pack.setId(model.getId());
        pack.setNom(model.getNom());
        pack.setPrix(model.getPrix());
        pack.setDescription(model.getDescription());
        pack.setImage(model.getImage());

        return pack;
    }
}
