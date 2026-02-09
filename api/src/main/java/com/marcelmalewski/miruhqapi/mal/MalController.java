package com.marcelmalewski.miruhqapi.mal;

import com.marcelmalewski.miruhqapi.mal.dto.AnimeDto;
import com.marcelmalewski.miruhqapi.mal.dto.AnimeDtoRest;
import com.marcelmalewski.miruhqapi.mal.dto.UserInfoDtoRest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

// TODO better names and better endpoints names
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

    @GetMapping("/api/users/@me")
    public UserInfoDtoRest getUserInfo() {
        return malService.getUserInfo();
    }

    @GetMapping("/api/users/@me/anime-list")
    public List<AnimeDto> findUserAnimeList() {
        return malService.findUserAnimeList();
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
    public void callback(
        @RequestParam String code,
        @RequestParam String state,
        HttpServletResponse response
    ) throws IOException {
        if (!Objects.equals(state, currentState)) {
            response.sendError(HttpStatus.FORBIDDEN.value(), "Invalid state");
            return;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        String body = "grant_type=authorization_code" +
            "&code=" + code +
            "&client_id=" + clientId +
            "&client_secret=" + clientSecret +
            "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8) +
            "&code_verifier=" + currentCodeChallenge;
        HttpEntity<String> entity = new HttpEntity<>(body, headers);

        RestTemplate rest = new RestTemplate();
        ResponseEntity<Map> tokenResponse = rest.exchange(
            "https://myanimelist.net/v1/oauth2/token",
            HttpMethod.POST,
            entity,
            Map.class
        );

        // TODO in respo body there is refresh_token
        Map<String, Object> respBody = tokenResponse.getBody();
        if (respBody != null && respBody.containsKey("access_token")) {
            String accessToken = (String) respBody.get("access_token");
            malService.setAccessToken(accessToken);
            System.out.println("Access Token: " + accessToken);
        }

        response.sendRedirect("http://localhost:4200/oauth-success");
    }
}
