package com.pfe.SalleDeSport.RestController;

import com.pfe.SalleDeSport.Repository.ReservationRepository;
import com.pfe.SalleDeSport.Security.AccountAccess;
import com.pfe.SalleDeSport.Service.VideoRoomTokens;
import com.pfe.SalleDeSport.Service.VideoRoomTokens.RoomToken;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class VideoRoomRestController {
    private final AccountAccess accounts;
    private final ReservationRepository reservations;
    private final VideoRoomTokens tokens;

    public VideoRoomRestController(AccountAccess accounts, ReservationRepository reservations, VideoRoomTokens tokens) {
        this.accounts = accounts;
        this.reservations = reservations;
        this.tokens = tokens;
    }

    @PostMapping("/video/rooms/{planId}/token")
    public ResponseEntity<RoomToken> createToken(@PathVariable Long planId, JwtAuthenticationToken authentication) {
        Jwt session = authentication.getToken();
        String role = session.getClaimAsString("role");
        Long accountId = Long.valueOf(session.getSubject());
        boolean canJoin = switch (role) {
            case "coach" -> accounts.ownsPlan(authentication, planId);
            case "client" -> reservations.countByPlanIdAndClientId(planId, accountId) > 0;
            default -> false;
        };
        if (!canJoin) {
            throw new AccessDeniedException("Video room access denied");
        }
        Map<String, Object> profile = session.getClaimAsMap("data");
        String name = (profile.getOrDefault("nom", "") + " " + profile.getOrDefault("prenom", "")).trim();
        String title = role.equals("coach") ? "Coach" : "Client";
        String userName = name.isEmpty() ? title : title + " " + name;
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(tokens.issue(planId, role, session.getSubject(), userName));
    }
}
