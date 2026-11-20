package com.pfe.SalleDeSport.RestController;

import com.pfe.SalleDeSport.Service.RevenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/revenue")
public class RevenueRestController {
    @Autowired
    private RevenueService revenueService;

    @GetMapping("/{salleId}/{year}")
    @PreAuthorize("@accountAccess.ownsAccount(authentication, #salleId)")
    public ResponseEntity<Map<Integer, BigDecimal>> getMonthlyRevenue(
            @PathVariable Long salleId,
            @PathVariable Integer year) {
        Map<Integer, BigDecimal> monthlyRevenue = revenueService.getMonthlyRevenue(salleId, year);
        return ResponseEntity.ok(monthlyRevenue);
    }

    @GetMapping("/{salleId}/{year}/total")
    @PreAuthorize("@accountAccess.ownsAccount(authentication, #salleId)")
    public ResponseEntity<BigDecimal> getTotalYearlyRevenue(
            @PathVariable Long salleId,
            @PathVariable Integer year) {
        BigDecimal totalRevenue = revenueService.getTotalYearlyRevenue(salleId, year);
        return ResponseEntity.ok(totalRevenue);
    }

    @GetMapping("/{salleId}/{year}/by-pack")
    @PreAuthorize("@accountAccess.ownsAccount(authentication, #salleId)")
    public ResponseEntity<List<Map<String, Object>>> getRevenueByPack(
            @PathVariable Long salleId,
            @PathVariable Integer year) {
        List<Map<String, Object>> revenueByPack = revenueService.getRevenueByPack(salleId, year);
        return ResponseEntity.ok(revenueByPack);
    }
}
