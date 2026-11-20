package com.pfe.SalleDeSport.Security;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class SessionTokens {
    static final String ISSUER = "fitconnect";
    private static final Duration LIFETIME = Duration.ofHours(1);
    private final JwtEncoder encoder;

    public SessionTokens(JwtEncoder encoder) {
        this.encoder = encoder;
    }

    public String issue(String role, Long id, String firstName, String lastName) {
        Instant now = Instant.now();
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id", id);
        if (firstName != null) {
            profile.put("prenom", firstName);
        }
        if (lastName != null) {
            profile.put("nom", lastName);
        }
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(id.toString())
                .issuedAt(now)
                .expiresAt(now.plus(LIFETIME))
                .claim("role", role)
                .claim("data", profile)
                .build();
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
    }
}
