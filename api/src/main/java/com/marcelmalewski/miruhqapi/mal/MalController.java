package com.marcelmalewski.miruhqapi.mal;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MalController {

    private String currentState;
    private String currentCodeChallenge;

    private final String redirectUri = "http://localhost:8080/oauth/mal/callback";

    @Value("${mal.client-id}")
    private String clientId;
    @Value("${mal.client-secret}")
    private String clientSecret;

    private final MalService malService;

    public MalController(MalService malService) {
        this.malService = malService;
    }

    @PostMapping("/api/anime/search")
    public List<AnimeDto> searchAnime(@RequestBody AnimeSearchRequest request) {
        return malService.search(request);
    }

    @GetMapping("/api/authenticate")
    public void authenticate(HttpServletResponse response) throws IOException {
        currentState = UUID.randomUUID().toString();
        currentCodeChallenge = UUID.randomUUID().toString() + UUID.randomUUID();

        String authorizeUrl =
            "https://myanimelist.net/v1/oauth2/authorize" +
                "?response_type=code" +
                "&client_id=" + clientId +
                "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
                "&scope=write:users" + "&state=" + currentState +
                "&code_challenge=" + currentCodeChallenge +
                "&code_challenge_method=plain";

        response.sendRedirect(authorizeUrl);
    }

    @GetMapping("/oauth/mal/callback")
    public ResponseEntity<String> callback(@RequestParam String code, @RequestParam String state) {
        if (!Objects.equals(state, currentState)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid state!");
        }

        return ResponseEntity.ok("OAuth successful. Authorization code: " + code);
    }
}
