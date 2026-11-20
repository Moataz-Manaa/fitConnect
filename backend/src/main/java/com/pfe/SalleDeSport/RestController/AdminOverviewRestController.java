package com.pfe.SalleDeSport.RestController;

import com.pfe.SalleDeSport.Repository.AdminRepository;
import com.pfe.SalleDeSport.Repository.ClientRepository;
import com.pfe.SalleDeSport.Repository.CoachRepository;
import com.pfe.SalleDeSport.Repository.SalleDeSportRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AdminOverviewRestController {
    private final AdminRepository admins;
    private final ClientRepository clients;
    private final CoachRepository coaches;
    private final SalleDeSportRepository gyms;

    public AdminOverviewRestController(AdminRepository admins, ClientRepository clients,
                                       CoachRepository coaches, SalleDeSportRepository gyms) {
        this.admins = admins;
        this.clients = clients;
        this.coaches = coaches;
        this.gyms = gyms;
    }

    @GetMapping("/admin/overview")
    public Overview overview() {
        return new Overview(admins.count(), clients.count(),
                new AccountCounts(coaches.countByEtat(true), coaches.countByEtat(false)),
                new AccountCounts(gyms.countByEtat(true), gyms.countByEtat(false)));
    }

    public record Overview(long admins, long clients, AccountCounts coaches, AccountCounts gyms) {}

    public record AccountCounts(long active, long inactive) {}
}
