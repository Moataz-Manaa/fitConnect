package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Abonnement;
import com.pfe.SalleDeSport.Entity.Pack;
import com.pfe.SalleDeSport.Repository.AbonnementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RevenueServiceImpl implements RevenueService {
    @Autowired
    private AbonnementRepository abonnementRepository;

    @Override
    public Map<Integer, BigDecimal> getMonthlyRevenue(Long salleId, Integer year) {
        List<Abonnement> abonnements = abonnementRepository.findBySalleIdAndYear(salleId, year);

        Map<Integer, BigDecimal> monthlyRevenue = new TreeMap<>();
        // Initialize all months with zero
        for (int month = 1; month <= 12; month++) {
            monthlyRevenue.put(month, BigDecimal.ZERO);
        }

        // Aggregate revenue by month based on dateCreation
        for (Abonnement abonnement : abonnements) {
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(abonnement.getDateCreation());
            int month = calendar.get(Calendar.MONTH) + 1;
            BigDecimal prix = abonnement.getPrix() != null ? abonnement.getPrix() : BigDecimal.ZERO;
            monthlyRevenue.merge(month, prix, BigDecimal::add);
        }

        return monthlyRevenue;
    }

    @Override
    public BigDecimal getTotalYearlyRevenue(Long salleId, Integer year) {
        return getMonthlyRevenue(salleId, year).values()
                .stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public List<Map<String, Object>> getRevenueByPack(Long salleId, Integer year) {
        List<Abonnement> abonnements = abonnementRepository.findBySalleIdAndYear(salleId, year);
        Map<Long, BigDecimal> revenueByPack = new HashMap<>();
        Map<Long, String> packNames = new HashMap<>();

        for (Abonnement abonnement : abonnements) {
            Pack pack = abonnement.getPack();
            Long packId = pack.getId();
            BigDecimal prix = abonnement.getPrix() != null ? abonnement.getPrix() : BigDecimal.ZERO;

            revenueByPack.merge(packId, prix, BigDecimal::add);
            packNames.putIfAbsent(packId, pack.getNom());
        }

        return revenueByPack.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> result = new HashMap<>();
                    result.put("packId", entry.getKey());
                    result.put("packName", packNames.get(entry.getKey()));
                    result.put("revenue", entry.getValue());
                    return result;
                })
                .collect(Collectors.toList());
    }
}