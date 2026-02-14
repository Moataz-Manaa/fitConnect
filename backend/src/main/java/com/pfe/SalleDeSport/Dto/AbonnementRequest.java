package com.pfe.SalleDeSport.Dto;

import java.math.BigDecimal;
import java.util.Date;

public class AbonnementRequest {
    private Long id;
    private Long idClient;
    private Long idPack;
    private BigDecimal prix;
    private Date paymentDate;
    private Date dateActivation;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdClient() {
        return idClient;
    }

    public void setIdClient(Long idClient) {
        this.idClient = idClient;
    }

    public Long getIdPack() {
        return idPack;
    }

    public void setIdPack(Long idPack) {
        this.idPack = idPack;
    }

    public BigDecimal getPrix() {
        return prix;
    }

    public void setPrix(BigDecimal prix) {
        this.prix = prix;
    }

    public Date getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(Date paymentDate) {
        this.paymentDate = paymentDate;
    }

    public Date getDateActivation() {
        return dateActivation;
    }

    public void setDateActivation(Date dateActivation) {
        this.dateActivation = dateActivation;
    }
}