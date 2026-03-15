package com.marcelmalewski.miruhqapi.mal;

import com.marcelmalewski.miruhqapi.mal.dto.AnimeDto;
import com.marcelmalewski.miruhqapi.mal.dto.PrincipalInfoDtoRest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
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
    public PrincipalInfoDtoRest getPrincipalInfo() {
        return malService.getPrincipalInfo("test");
    }

    @GetMapping("/api/users/@me/anime-list")
    public List<AnimeDto> findPrincipalAnimeList(@RequestParam Integer limit,
        @RequestParam Integer offset, @RequestParam String status, @RequestParam String sortField) {
        return malService.findPrincipalAnimeList(limit, offset, status, sortField);
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
        malOAuthService.handleCallback(code, state);
        response.sendRedirect("http://localhost:4200/oauth-success");
    }
}
