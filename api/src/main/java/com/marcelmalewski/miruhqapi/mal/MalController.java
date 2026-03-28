package com.marcelmalewski.miruhqapi.mal;

import com.marcelmalewski.miruhqapi.mal.dto.AnimeDto;
import com.marcelmalewski.miruhqapi.mal.dto.MalTokenDtoRest;
import com.marcelmalewski.miruhqapi.mal.dto.PrincipalInfoDtoRest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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

    @GetMapping("/api/users/{userId}")
    public PrincipalInfoDtoRest getPrincipalInfo(@PathVariable Integer userId) {
        return malService.getPrincipalInfo(userId);
    }

    @GetMapping("/api/users/{userId}/anime-list")
    public List<AnimeDto> findPrincipalAnimeList(@PathVariable Integer userId,
        @RequestParam Integer limit,
        @RequestParam Integer offset, @RequestParam String status, @RequestParam String sortField) {
        return malService.findPrincipalAnimeList(userId, limit, offset, status, sortField);
    }

    @GetMapping("/api/anime")
    public List<AnimeDto> findAnime(@RequestParam Integer limit, @RequestParam Integer offset,
        @RequestParam String title) {
        return malService.findAnime(limit, offset, title);
    }

    @GetMapping("/api/oauth/mal/login")
    public void login(HttpServletResponse response, HttpSession session) throws IOException {
        String authorizeUrl = malOAuthService.buildAuthorizationUrl(session);
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
    public MalTokenDtoRest exchange(@RequestParam String code, @RequestParam String state,
        HttpSession session
    ) {
        return malOAuthService.handleCallback(code, state, session);
    }
}
