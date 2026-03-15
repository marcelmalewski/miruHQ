package com.marcelmalewski.miruhqapi.mal.maltoken;

import java.time.OffsetDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class MalTokenService {
    private final MalTokenRepository tokenRepository;
    private final RestClient restClient;

    @Value("${mal.client-id}")
    private String clientId;

    public MalTokenService(MalTokenRepository tokenRepository, RestClient restClient) {
        this.tokenRepository = tokenRepository;
        this.restClient = restClient;
    }

    public String getValidAccessToken(String username) {
        MalToken token = tokenRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalStateException("User not authenticated with MAL"));

        if (token.willExpireSoon()) {
            token = refreshToken(token);
        }

        return token.getAccessToken();
    }

    private MalToken refreshToken(MalToken token) {
        final MalTokenDtoRest response = restClient.post()
            .uri("https://myanimelist.net/v1/oauth2/token").retrieve()
            .body(MalTokenDtoRest.class);

        token.setAccessToken(response.accessToken());
        token.setRefreshToken(response.refreshToken());
        token.setExpiresAt(OffsetDateTime.now().plusSeconds(response.expiresIn()));

        return tokenRepository.save(token);
    }
}
