package com.pfe.SalleDeSport.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Service
public class VideoRoomTokens {
    private static final int IV_LENGTH = 16;
    private static final int TOKEN_LIFETIME_SECONDS = 300;
    private final SecureRandom random = new SecureRandom();
    private final ObjectMapper json;
    private final long appId;
    private final byte[] secret;

    public VideoRoomTokens(ObjectMapper json, @Value("${FITCONNECT_ZEGO_APP_ID:0}") long appId,
                           @Value("${FITCONNECT_ZEGO_SERVER_SECRET:}") String secret) {
        this.json = json;
        this.appId = appId;
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
    }

    public RoomToken issue(Long planId, String role, String accountId, String userName) {
        if (appId <= 0 || secret.length != 32) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Video service unavailable");
        }
        String roomId = "planning_" + planId + "_room";
        String userId = role + "_" + accountId + "_" + UUID.randomUUID().toString().replace("-", "");
        long now = Instant.now().getEpochSecond();
        long expiry = now + TOKEN_LIFETIME_SECONDS;
        try {
            String payload = json.writeValueAsString(Map.of("room_id", roomId, "privilege", Map.of("1", 1, "2", 1)));
            byte[] claims = json.writeValueAsBytes(Map.of("app_id", appId, "user_id", userId, "ctime", now,
                    "expire", expiry, "nonce", random.nextInt(), "payload", payload));
            byte[] iv = new byte[IV_LENGTH];
            random.nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(secret, "AES"), new IvParameterSpec(iv));
            byte[] encrypted = cipher.doFinal(claims);

            // ZEGOCLOUD Token04 uses a big-endian expiry followed by two length-prefixed byte sequences.
            byte[] envelope = ByteBuffer.allocate(Long.BYTES + 2 * Short.BYTES + iv.length + encrypted.length)
                    .putLong(expiry).putShort((short) iv.length).put(iv)
                    .putShort((short) encrypted.length).put(encrypted).array();
            return new RoomToken(appId, roomId, userId, userName, "04" + Base64.getEncoder().encodeToString(envelope));
        } catch (GeneralSecurityException | JsonProcessingException failure) {
            throw new IllegalStateException("Could not create video room token", failure);
        }
    }

    public record RoomToken(long appId, String roomId, String userId, String userName, String token) { }
}
