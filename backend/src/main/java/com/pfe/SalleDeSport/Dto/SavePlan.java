package com.pfe.SalleDeSport.Dto;

import com.pfe.SalleDeSport.Entity.Plan;

import java.util.Date;

public class SavePlan {
    private Long id;
    private Date date;
    private String debut;
    private String fin;
    private String description;
    private Float prix;
    private Long idCoach;
    private Long idCategory;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public String getDebut() {
        return debut;
    }

    public void setDebut(String debut) {
        this.debut = debut;
    }

    public String getFin() {
        return fin;
    }

    public void setFin(String fin) {
        this.fin = fin;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Float getPrix() {
        return prix;
    }

    public void setPrix(Float prix) {
        this.prix = prix;
    }

    public Long getIdCoach() {
        return idCoach;
    }

    public void setIdCoach(Long idCoach) {
        this.idCoach = idCoach;
    }

    public Long getIdCategory() {
        return idCategory;
    }

    public void setIdCategory(Long idCategory) {
        this.idCategory = idCategory;
    }

    public static Plan toEntity(SavePlan model) {
        if (model == null) {
            return null;
        }
        Plan planning = new Plan();
        planning.setId(model.getId());
        planning.setDescription(model.getDescription());
        planning.setDate(model.getDate());
        planning.setDebut(model.getDebut());
        planning.setFin(model.getFin());
        planning.setPrix(model.getPrix());
        return planning;
    }
}