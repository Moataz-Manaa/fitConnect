package com.pfe.SalleDeSport.Service;

import com.pfe.SalleDeSport.Entity.Abonnement;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface RevenueService {
    Map<Integer, BigDecimal> getMonthlyRevenue(Long salleId, Integer year);
    BigDecimal getTotalYearlyRevenue(Long salleId, Integer year);
    List<Map<String, Object>> getRevenueByPack(Long salleId, Integer year);
}
