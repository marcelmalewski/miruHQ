package com.marcelmalewski.miruhqapi.mal;

import com.marcelmalewski.miruhqapi.mal.dto.AnimeDto;
import com.marcelmalewski.miruhqapi.mal.dto.MalTokenDto;
import com.marcelmalewski.miruhqapi.mal.dto.PrincipalInfoDtoRest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MalController {

    private final MalService malService;
    private final MalOAuthService malOAuthService;

    public MalController(MalService malService, MalOAuthService malOAuthService) {
        this.malService = malService;
        this.malOAuthService = malOAuthService;
    }

    @GetMapping("/api/users/@me")
    public PrincipalInfoDtoRest getPrincipalInfo(@RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        return malService.getPrincipalInfo(token);
    }

    @GetMapping("/api/users/@me/anime-list")
    public List<AnimeDto> findPrincipalAnimeList(
        @RequestHeader("Authorization") String authHeader,
        @RequestParam Integer limit,
        @RequestParam Integer offset,
        @RequestParam String status,
        @RequestParam String sortField) {

        String token = extractToken(authHeader);
        return malService.findPrincipalAnimeList(token, limit, offset, status, sortField);
    }

    @GetMapping("/api/anime")
    public List<AnimeDto> findAnime(@RequestParam Integer limit, @RequestParam Integer offset,
        @RequestParam String title) {
        return malService.findAnime(limit, offset, title);
    }

    @GetMapping("/api/oauth/mal/login")
    public void login(HttpServletResponse response) throws IOException {
        String authorizeUrl = malOAuthService.buildAuthorizationUrl();
        response.sendRedirect(authorizeUrl);
    }

    @GetMapping("/api/oauth/mal/callback")
    public void callback(@RequestParam String code, @RequestParam String state,
        HttpServletResponse response) throws IOException {

        String redirectUrl = "http://localhost:4200/oauth-success#" +
            "code=" + code +
            "&state=" + state;
        response.sendRedirect(redirectUrl);
    }

    @PostMapping("/api/oauth/mal/exchange")
    public MalTokenDto exchange(
        @RequestParam String code,
        @RequestParam String state
    ) {
        return malOAuthService.exchangeCode(code, state);
    }

    private String extractToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing or invalid Authorization header");
        }
        return authHeader.substring(7); // remove "Bearer "
    }
}
