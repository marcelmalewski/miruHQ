package com.marcelmalewski.miruhqapi.mal;

import com.marcelmalewski.miruhqapi.config.AppProperties;
import com.marcelmalewski.miruhqapi.mal.dto.AnimeDto;
import com.marcelmalewski.miruhqapi.mal.dto.MalTokenDto;
import com.marcelmalewski.miruhqapi.mal.dto.PrincipalInfoDto;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MalController {

    private final MalService malService;
    private final MalOAuthService malOAuthService;
    private final AppProperties appProperties;

    public MalController(MalService malService, MalOAuthService malOAuthService,
        AppProperties appProperties) {
        this.malService = malService;
        this.malOAuthService = malOAuthService;
        this.appProperties = appProperties;
    }

    @GetMapping("/api/users/@me")
    public PrincipalInfoDto getPrincipalInfo(@RequestHeader("Authorization") String authHeader) {
        String token = MalOAuthService.extractToken(authHeader);
        return malService.getPrincipalInfo(token);
    }

    @GetMapping("/api/users/@me/anime-list")
    public List<AnimeDto> findPrincipalAnimeList(
        @RequestHeader("Authorization") String authHeader,
        @RequestParam Integer limit,
        @RequestParam Integer offset,
        @RequestParam String status,
        @RequestParam String sortField) {

        String token = MalOAuthService.extractToken(authHeader);
        return malService.findPrincipalAnimeList(token, limit, offset, status, sortField);
    }

    @GetMapping("/api/users/@me/missing-titles")
    public List<AnimeDto> findPrincipalMissingTitles(
        @RequestHeader("Authorization") String authHeader,
        @RequestParam Integer limit,
        @RequestParam Integer offset,
        @RequestParam String status,
        @RequestParam String sortField,
        @RequestParam Boolean refreshPrincipalAnime,
        @RequestParam Boolean refreshAnimeRelations,
        @RequestParam(required = false) List<String> relationTypes
        ) {

        String token = MalOAuthService.extractToken(authHeader);
        return malService.findPrincipalMissingTitles(token, limit, offset, status, sortField, refreshPrincipalAnime, refreshAnimeRelations, relationTypes);
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
        String redirectUrl = appProperties.oauthUrl() + "/oauth-success#" +
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

    @PostMapping("/api/oauth/mal/refresh")
    public MalTokenDto refresh(@RequestParam String refreshToken) {
        return malOAuthService.refreshToken(refreshToken);
    }
}
