package com.marcelmalewski.miruhqapi.mal;

import static org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED;

import com.marcelmalewski.miruhqapi.mal.dto.MalTokenDtoRest;
import jakarta.servlet.http.HttpSession;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MalOAuthService {
    private static final String REDIRECT_URI = "http://localhost:8080/api/oauth/mal/callback";

    @Value("${mal.client-id}")
    private String clientId;
    @Value("${mal.client-secret}")
    private String clientSecret;

    private final WebClient malWebClient;

    public MalOAuthService(WebClient malWebClient) {
        this.malWebClient = malWebClient;
    }

    String buildAuthorizationUrl(HttpSession session) {
        final var state = UUID.randomUUID().toString();
        final var codeChallenge = generateCodeChallenge();

        session.setAttribute("mal_state", state);
        session.setAttribute("mal_code_challenge", codeChallenge);

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

    MalTokenDtoRest handleCallback(String code, String state, HttpSession session) {
        final var expectedState = (String) session.getAttribute("mal_state");
        final var codeChallenge = (String) session.getAttribute("mal_code_challenge");

        if (!state.equals(expectedState)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid state");
        }

        final var body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("grant_type", "authorization_code");
        body.add("code", code);
        body.add("redirect_uri", REDIRECT_URI);
        body.add("code_verifier", codeChallenge);

        final var token = malWebClient.post()
            .uri("/v1/oauth2/token")
            .contentType(APPLICATION_FORM_URLENCODED)
            .bodyValue(body)
            .retrieve()
            .bodyToMono(MalTokenDtoRest.class)
            .block();
        if (token == null) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "Failed to retrieve access token from MAL");
        }
        return token;
    }
}
