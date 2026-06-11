package com.marcelmalewski.miruhqapi.mal;

import static com.marcelmalewski.miruhqapi.config.MalClientConfig.MAL_URL_BASE;
import static org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED;

import com.marcelmalewski.miruhqapi.config.AppProperties;
import com.marcelmalewski.miruhqapi.mal.dto.MalTokenDto;
import com.marcelmalewski.miruhqapi.mal.dto.MalTokenDtoMapper;
import com.marcelmalewski.miruhqapi.mal.dto.MalTokenDtoRest;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MalOAuthService {

    private static final int MAX_STATES = 10_000;
    private static final String REDIRECT_URI = "/api/oauth/mal/callback";

    @Value("${mal.client-id}")
    private String clientId;
    @Value("${mal.client-secret}")
    private String clientSecret;

    private final Map<String, StoredState> stateStore = new ConcurrentHashMap<>();

    private final RestClient malV1Client;
    private final MalTokenDtoMapper malTokenDtoMapper;
    private final AppProperties appProperties;

    public MalOAuthService(RestClient malV1Client, MalTokenDtoMapper malTokenDtoMapper,
        AppProperties appProperties) {
        this.malV1Client = malV1Client;
        this.malTokenDtoMapper = malTokenDtoMapper;
        this.appProperties = appProperties;
    }

    protected String buildAuthorizationUrl() {
        if (stateStore.size() >= MAX_STATES) {
            cleanupExpiredStates();

            if (stateStore.size() >= MAX_STATES) {
                throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Too many pending requests. Try again later."
                );
            }
        }

        final var state = UUID.randomUUID().toString();
        final var codeVerifier = generateCodeVerifier();

        stateStore.put(state, new StoredState(codeVerifier, Instant.now()));

        return MAL_URL_BASE + "v1/oauth2/authorize"
            + "?response_type=code"
            + "&client_id=" + clientId
            + "&redirect_uri=" + appProperties.backendUrl() + REDIRECT_URI
            + "&state=" + state
            + "&code_challenge=" + codeVerifier
            + "&code_challenge_method=plain";
    }

    private static String generateCodeVerifier() {
        return UUID.randomUUID().toString().replace("-", "")
            + UUID.randomUUID().toString().replace("-", "");
    }

    protected MalTokenDto exchangeCode(String code, String state) {
        final var stored = stateStore.remove(state);

        if (stored == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid or expired state");
        }

        if (stored.createdAt().isBefore(Instant.now().minusSeconds(300))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "State expired");
        }

        final var body = new LinkedMultiValueMap<String, String>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("grant_type", "authorization_code");
        body.add("code", code);
        body.add("redirect_uri", appProperties.backendUrl() + REDIRECT_URI);
        body.add("code_verifier", stored.codeVerifier());

        final var token = malV1Client.post()
            .uri("/oauth2/token")
            .contentType(APPLICATION_FORM_URLENCODED)
            .body(body)
            .retrieve()
            .onStatus(HttpStatusCode::isError, (request, response) -> {
                throw new ResponseStatusException(
                    response.getStatusCode(),
                    "MAL token exchange failed"
                );
            })
            .body(MalTokenDtoRest.class);

        if (token == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "Failed to retrieve access token from MAL"
            );
        }
        return this.malTokenDtoMapper.toMalTokenDto(token);
    }

    protected MalTokenDto refreshToken(String refreshToken) {
        final var body = new LinkedMultiValueMap<String, String>();
        body.add("grant_type", "refresh_token");
        body.add("refresh_token", refreshToken);
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);

        final var token = malV1Client.post()
            .uri("/oauth2/token")
            .contentType(APPLICATION_FORM_URLENCODED)
            .body(body)
            .retrieve()
            .onStatus(HttpStatusCode::isError, (request, response) -> {
                throw new ResponseStatusException(
                    response.getStatusCode(),
                    "MAL token exchange failed"
                );
            })
            .body(MalTokenDtoRest.class);

        if (token == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "Failed to refresh token from MAL"
            );
        }
        return this.malTokenDtoMapper.toMalTokenDto(token);
    }

    @Scheduled(fixedRate = 60_000)
    private void cleanupExpiredStates() {
        final var cutoff = Instant.now().minusSeconds(300);

        stateStore.entrySet().removeIf(entry ->
            entry.getValue().createdAt().isBefore(cutoff)
        );
    }

    protected static String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing or invalid Authorization header");
        }
        return authHeader.substring(7); // remove "Bearer "
    }
}
