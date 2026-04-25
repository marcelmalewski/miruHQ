package com.marcelmalewski.miruhqapi.mal;

import com.marcelmalewski.miruhqapi.mal.dto.AnimeDto;
import com.marcelmalewski.miruhqapi.mal.dto.AnimeDtoMapper;
import com.marcelmalewski.miruhqapi.mal.dto.AnimeDtoRest;
import com.marcelmalewski.miruhqapi.mal.dto.AnimeListDtoRest;
import com.marcelmalewski.miruhqapi.mal.dto.PrincipalInfoDtoRest;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class MalService {
    private final RestClient publicApiClient;
    private final RestClient malApiPrincipalClient;
    private final AnimeDtoMapper animeDtoMapper;

    public MalService(@Qualifier("malApiPublicClient") RestClient publicApiClient,
        @Qualifier("malApiPrincipalClient") RestClient malApiPrincipalClient,
        AnimeDtoMapper animeDtoMapper) {
        this.publicApiClient = publicApiClient;
        this.malApiPrincipalClient = malApiPrincipalClient;
        this.animeDtoMapper = animeDtoMapper;
    }

    protected PrincipalInfoDtoRest getPrincipalInfo(String token) {
        return malApiPrincipalClient.get().uri(uriBuilder -> uriBuilder.path("/users/@me").build())
            .header("Authorization", "Bearer " + token).retrieve()
            .body(PrincipalInfoDtoRest.class);
    }

    protected List<AnimeDto> findPrincipalAnimeList(String token, Integer limit, Integer offset,
        String status, String sortField) {
        final var response = malApiPrincipalClient.get()
            .uri(uriBuilder -> uriBuilder.path("/users/@me/animelist")
                .queryParam("fields", AnimeDtoRest.DEFAULT_FIELDS)
                .queryParam("status", status)
                .queryParam("limit", limit)
                .queryParam("offset", offset)
                .queryParam("sort", sortField)
                .build())
            .header("Authorization", "Bearer " + token)
            .retrieve()
            .body(AnimeListDtoRest.class);

        return mapAnimeListDto(response);
    }

    protected List<AnimeDto> findAnime(Integer limit, Integer offset, String title) {
        final var response = publicApiClient.get()
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
