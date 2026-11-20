package com.pfe.SalleDeSport.Security;

import com.pfe.SalleDeSport.Entity.Admin;
import com.pfe.SalleDeSport.Entity.Client;
import com.pfe.SalleDeSport.Entity.Coach;
import com.pfe.SalleDeSport.Entity.SalleDeSport;
import com.pfe.SalleDeSport.Repository.AdminRepository;
import com.pfe.SalleDeSport.Repository.ClientRepository;
import com.pfe.SalleDeSport.Repository.CoachRepository;
import com.pfe.SalleDeSport.Repository.CoachSalleRepository;
import com.pfe.SalleDeSport.Repository.PackRepository;
import com.pfe.SalleDeSport.Repository.PlanRepository;
import com.pfe.SalleDeSport.Repository.SalleDeSportRepository;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class AccountAccess {
    public static final String SUPER_ADMIN = "Super Administrateur";
    private final AdminRepository admins;
    private final ClientRepository clients;
    private final CoachRepository coaches;
    private final SalleDeSportRepository gyms;
    private final PackRepository packs;
    private final CoachSalleRepository gymCoaches;
    private final PlanRepository plans;

    public AccountAccess(AdminRepository admins, ClientRepository clients, CoachRepository coaches,
                         SalleDeSportRepository gyms, PackRepository packs, CoachSalleRepository gymCoaches,
                         PlanRepository plans) {
        this.admins = admins;
        this.clients = clients;
        this.coaches = coaches;
        this.gyms = gyms;
        this.packs = packs;
        this.gymCoaches = gymCoaches;
        this.plans = plans;
    }

    boolean isActive(String role, Long id) {
        return switch (role) {
            case "admin" -> admins.existsById(id);
            case "client" -> clients.findById(id).map(Client::isEtat).orElse(false);
            case "coach" -> coaches.findById(id).map(Coach::isEtat).orElse(false);
            case "salle" -> gyms.findById(id).map(SalleDeSport::isEtat).orElse(false);
            default -> false;
        };
    }

    public boolean isSuperAdmin(Authentication authentication) {
        return admins.findById(Long.valueOf(authentication.getName()))
                .map(Admin::getRole).filter(SUPER_ADMIN::equals).isPresent();
    }

    public boolean ownsAccount(Authentication authentication, Long id) {
        return id != null && id.toString().equals(authentication.getName());
    }

    public boolean ownsPack(Authentication authentication, Long id) {
        return packs.findById(id).map(pack -> pack.getSalle())
                .map(gym -> ownsAccount(authentication, gym.getId())).orElse(false);
    }

    public boolean ownsGymCoach(Authentication authentication, Long id) {
        return gymCoaches.findById(id).map(coach -> coach.getSalleDeSport())
                .map(gym -> ownsAccount(authentication, gym.getId())).orElse(false);
    }

    public boolean ownsPlan(Authentication authentication, Long id) {
        return plans.findById(id).map(plan -> plan.getCoach())
                .map(coach -> ownsAccount(authentication, coach.getId())).orElse(false);
    }
}
