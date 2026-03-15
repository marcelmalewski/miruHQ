package com.marcelmalewski.miruhqapi.mal;

import static org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED;

import com.marcelmalewski.miruhqapi.mal.maltoken.MalTokenDtoRest;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
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
    private final Map<String, String> stateToCodeChallenge = new ConcurrentHashMap<>();

    @Value("${mal.client-id}")
    private String clientId;
    @Value("${mal.client-secret}")
    private String clientSecret;

    private final WebClient malWebClient;

    public MalOAuthService(WebClient malWebClient) {
        this.malWebClient = malWebClient;
    }

    String buildAuthorizationUrl() {
        String state = UUID.randomUUID().toString();
        String codeChallenge = generateCodeChallenge();

        stateToCodeChallenge.put(state, codeChallenge);

        return "https://myanimelist.net/v1/oauth2/authorize"
            + "?response_type=code"
            + "&client_id=" + clientId
            + "&redirect_uri=" + REDIRECT_URI
            + "&state=" + state
            + "&code_challenge=" + codeChallenge
            + "&code_challenge_method=plain";
    }

    private String generateCodeChallenge() {
        return UUID.randomUUID().toString().replace("-", "")
            + UUID.randomUUID().toString().replace("-", "");
    }

    void handleCallback(String code, String state) {
        final String codeChallenge = stateToCodeChallenge.remove(state);
        if (codeChallenge == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid state");
        }

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("grant_type", "authorization_code");
        body.add("code", code);
        body.add("redirect_uri", REDIRECT_URI);
        body.add("code_verifier", codeChallenge);

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
