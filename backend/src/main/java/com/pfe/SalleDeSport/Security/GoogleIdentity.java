package com.pfe.SalleDeSport.Security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class GoogleIdentity {
    private final NimbusJwtDecoder decoder;

    public GoogleIdentity(@Value("${fitconnect.google-client-id}") String clientId) {
        this.decoder = NimbusJwtDecoder.withJwkSetUri("https://www.googleapis.com/oauth2/v3/certs").build();
        var timestamps = JwtValidators.createDefault();
        decoder.setJwtValidator(identity -> {
            var standard = timestamps.validate(identity);
            if (standard.hasErrors()) {
                return standard;
            }
            String issuer = identity.getClaimAsString("iss");
            List<String> audience = identity.getAudience();
            String email = identity.getClaimAsString("email");
            String domain = identity.getClaimAsString("hd");
            boolean googleManagesEmail = email != null && (email.toLowerCase(Locale.ROOT).endsWith("@gmail.com")
                    || (domain != null && !domain.isBlank()));
            if (("https://accounts.google.com".equals(issuer) || "accounts.google.com".equals(issuer))
                    && audience != null && audience.contains(clientId) && identity.getExpiresAt() != null
                    && identity.getSubject() != null && googleManagesEmail
                    && Boolean.TRUE.equals(identity.getClaimAsBoolean("email_verified"))) {
                return OAuth2TokenValidatorResult.success();
            }
            return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token"));
        });
    }

    public Jwt verify(String idToken) {
        return decoder.decode(idToken);
    }
}
