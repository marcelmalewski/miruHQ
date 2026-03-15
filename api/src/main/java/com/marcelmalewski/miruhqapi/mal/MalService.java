package com.marcelmalewski.miruhqapi.mal;

import com.marcelmalewski.miruhqapi.mal.dto.AnimeDto;
import com.marcelmalewski.miruhqapi.mal.dto.AnimeDtoMapper;
import com.marcelmalewski.miruhqapi.mal.dto.AnimeDtoRest;
import com.marcelmalewski.miruhqapi.mal.dto.AnimeListDtoRest;
import com.marcelmalewski.miruhqapi.mal.dto.PrincipalInfoDtoRest;
import com.marcelmalewski.miruhqapi.mal.maltoken.MalToken;
import com.marcelmalewski.miruhqapi.mal.maltoken.MalTokenRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class MalService {

    private final RestClient restClient;
    private final MalTokenRepository tokenRepository;
    private final AnimeDtoMapper animeDtoMapper;

    public MalService(RestClient restClient, AnimeDtoMapper animeDtoMapper, MalTokenRepository tokenRepository) {
        this.restClient = restClient;
        this.animeDtoMapper = animeDtoMapper;
        this.tokenRepository = tokenRepository;
    }

    PrincipalInfoDtoRest getPrincipalInfo(String username) {
        final String accessToken = getAccessToken(username);

        return restClient.get().uri(uriBuilder -> uriBuilder.path("/users/@me").build())
            .header("Authorization", "Bearer " + accessToken).retrieve()
            .body(PrincipalInfoDtoRest.class);
    }

    List<AnimeDto> findPrincipalAnimeList(Integer limit, Integer offset, String status, String sortField) {
        final String accessToken = getAccessToken("username");

        final AnimeListDtoRest response = restClient.get()
            .uri(uriBuilder -> uriBuilder.path("/users/@me/animelist")
                .queryParam("fields", AnimeDtoRest.DEFAULT_FIELDS)
                .queryParam("status", status)
                .queryParam("limit", limit)
                .queryParam("offset", offset)
                .queryParam("sort", sortField)
                .build())
            .header("Authorization", "Bearer " + accessToken)
            .retrieve()
            .body(AnimeListDtoRest.class);

        return mapAnimeListDto(response);
    }

    private String getAccessToken(String username) {
        final MalToken token = tokenRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalStateException("User not authenticated with MAL"));

        if (token.isExpired()) {
            throw new IllegalStateException("Access token expired");
        }

        return token.getAccessToken();
    }

    final List<AnimeDto> findAnime(Integer limit, Integer offset, String title) {
        AnimeListDtoRest response = restClient.get()
            .uri(uriBuilder -> uriBuilder.path("/anime")
                .queryParam("fields", AnimeDtoRest.DEFAULT_FIELDS)
                .queryParam("limit", limit)
                .queryParam("offset", offset)
                .queryParam("q", title)
                .build())
            .retrieve()
            .body(AnimeListDtoRest.class);

        return mapAnimeListDto(response);
    }

    private List<AnimeDto> mapAnimeListDto(AnimeListDtoRest animeListDtoRest) {
        if (animeListDtoRest == null) {
            return new ArrayList<>();
        }

        return animeListDtoRest.data().stream().map(
                animeListDataDtoRest -> this.animeDtoMapper.toAnimeDto(animeListDataDtoRest.node()))
            .toList();
    }
}
