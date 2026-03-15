package com.marcelmalewski.miruhqapi.mal;

import static org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED;

import com.marcelmalewski.miruhqapi.mal.maltoken.MalTokenDtoRest;
import java.util.Objects;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MalOAuthService {
    private static final String REDIRECT_URI = "http://localhost:8080/api/oauth/mal/callback";
    private String currentState;
    private String currentCodeChallenge;

    @Value("${mal.client-id}")
    private String clientId;
    @Value("${mal.client-secret}")
    private String clientSecret;

    private final WebClient malWebClient;

    public MalOAuthService(WebClient malWebClient) {
        this.malWebClient = malWebClient;
    }

    String buildAuthorizationUrl() {
        currentState = UUID.randomUUID().toString();
        currentCodeChallenge = UUID.randomUUID().toString() + UUID.randomUUID();

        return "https://myanimelist.net/v1/oauth2/authorize"
            + "?response_type=code"
            + "&client_id=" + clientId
            + "&state=" + currentState
            + "&redirect_uri=" + REDIRECT_URI
            + "&code_challenge=" + currentCodeChallenge
            + "&code_challenge_method=plain";
    }

    void handleCallback(String code, String state) {
        if (!Objects.equals(state, currentState)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid state");
        }

        final MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("grant_type", "authorization_code");
        body.add("code", code);
        body.add("redirect_uri", REDIRECT_URI);
        body.add("code_verifier", currentCodeChallenge);

        final MalTokenDtoRest token = malWebClient.post()
            .uri("/v1/oauth2/token")
            .contentType(APPLICATION_FORM_URLENCODED)
            .bodyValue(body)
            .retrieve()
            .bodyToMono(MalTokenDtoRest.class)
            .block();

        if (token != null) {
            System.out.println("Access token: " + token.accessToken());
        }
    }
}
