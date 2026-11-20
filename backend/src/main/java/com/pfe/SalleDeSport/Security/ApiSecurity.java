package com.pfe.SalleDeSport.Security;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import jakarta.servlet.DispatcherType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Set;

@Configuration
@EnableMethodSecurity
public class ApiSecurity {
    @Bean
    SecretKey signingKey(@Value("${FITCONNECT_JWT_SECRET:}") String encoded, Environment environment) {
        byte[] bytes;
        if (encoded.isBlank() && environment.matchesProfiles("local", "test")) {
            bytes = new byte[32];
            new SecureRandom().nextBytes(bytes);
        } else {
            try {
                bytes = Base64.getDecoder().decode(encoded);
            } catch (IllegalArgumentException ignored) {
                throw new IllegalStateException("FITCONNECT_JWT_SECRET must be Base64-encoded");
            }
            if (bytes.length < 32) {
                throw new IllegalStateException("FITCONNECT_JWT_SECRET must contain at least 32 random bytes");
            }
        }
        return new SecretKeySpec(bytes, "HmacSHA256");
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey signingKey) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(signingKey));
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey signingKey, AccountAccess accounts) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(signingKey).macAlgorithm(MacAlgorithm.HS256).build();
        var standard = JwtValidators.createDefaultWithIssuer(SessionTokens.ISSUER);
        decoder.setJwtValidator(jwt -> {
            var validation = standard.validate(jwt);
            if (validation.hasErrors()) {
                return validation;
            }
            String role = jwt.getClaimAsString("role");
            String subject = jwt.getSubject();
            if (jwt.getExpiresAt() == null || role == null || !Set.of("admin", "client", "coach", "salle").contains(role)
                    || subject == null || !subject.matches("[1-9][0-9]{0,18}")) {
                return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token"));
            }
            try {
                if (accounts.isActive(role, Long.parseLong(subject))) {
                    return OAuth2TokenValidatorResult.success();
                }
            } catch (NumberFormatException ignored) {
                // An out-of-range subject cannot identify an account.
            }
            return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token"));
        });
        return decoder;
    }

    @Bean
    SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
        var roles = new JwtGrantedAuthoritiesConverter();
        roles.setAuthoritiesClaimName("role");
        roles.setAuthorityPrefix("ROLE_");
        var converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(roles);
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .oauth2ResourceServer(server -> server.jwt(jwt -> jwt.jwtAuthenticationConverter(converter)))
                .authorizeHttpRequests(access -> access
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers(HttpMethod.POST, "/admin/login", "/client/login", "/coach/login", "/salleDeSport/login",
                                "/client/login-google", "/client/forgot-password", "/client/reset-password",
                                "/client/confirm-account", "/client", "/coach", "/salleDeSport", "/contact").permitAll()
                        .requestMatchers(HttpMethod.GET, "/client/confirm-account", "/category", "/coach", "/coach/{id:[0-9]+}",
                                "/salleDeSport", "/salleDeSport/{id:[0-9]+}", "/pack", "/pack/{id:[0-9]+}",
                                "/pack/get-id/{id}", "/pack/salle/{id}", "/coachSalle/salle/{id}", "/plan/coach/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/coach/{id}/clients").hasRole("coach")
                        .requestMatchers(HttpMethod.GET, "/client/{id}").hasAnyRole("client", "admin")
                        .requestMatchers(HttpMethod.PUT, "/client/edit/{id}").hasRole("client")
                        .requestMatchers(HttpMethod.PUT, "/coach/edit/{id}").hasRole("coach")
                        .requestMatchers(HttpMethod.PUT, "/salleDeSport/edit/{id}").hasRole("salle")
                        .requestMatchers(HttpMethod.GET, "/salleDeSport/my-clients", "/pack/my-packs", "/coachSalle/my-coach", "/revenue/**").hasRole("salle")
                        .requestMatchers(HttpMethod.POST, "/pack", "/coachSalle").hasRole("salle")
                        .requestMatchers(HttpMethod.GET, "/coachSalle/{id}").hasRole("salle")
                        .requestMatchers(HttpMethod.PUT, "/pack/{id}", "/coachSalle/{id}").hasRole("salle")
                        .requestMatchers(HttpMethod.DELETE, "/pack/{id}", "/coachSalle/{id}").hasRole("salle")
                        .requestMatchers(HttpMethod.POST, "/video/rooms/{planId}/token").hasAnyRole("client", "coach")
                        .requestMatchers(HttpMethod.POST, "/plan").hasRole("coach")
                        .requestMatchers(HttpMethod.PUT, "/plan/{id}").hasRole("coach")
                        .requestMatchers(HttpMethod.DELETE, "/plan/{id}").hasRole("coach")
                        .requestMatchers(HttpMethod.POST, "/checkout/stripe/webhook").permitAll()
                        .requestMatchers(HttpMethod.POST, "/checkout", "/checkout/{id}/confirm", "/checkout/{id}/cancel").hasRole("client")
                        .requestMatchers(HttpMethod.POST, "/reservation", "/abonnement", "/abonnement/renouveler").denyAll()
                        .requestMatchers(HttpMethod.GET, "/reservation/get-all-by-id-client/{id}", "/abonnement/get-all-by-id-Client/{id}").hasRole("client")
                        .requestMatchers(HttpMethod.GET, "/reservation/get-all-by-id-coach/{id}").hasRole("coach")
                        .requestMatchers("/admin/**", "/client/**", "/coach/**", "/salleDeSport/**", "/contact/**", "/category/**",
                                "/abonnement", "/coachSalle", "/plan").hasRole("admin")
                        .anyRequest().denyAll())
                .build();
    }
}
