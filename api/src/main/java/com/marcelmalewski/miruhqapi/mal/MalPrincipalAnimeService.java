package com.marcelmalewski.miruhqapi.mal;

import com.marcelmalewski.miruhqapi.mal.dto.AnimeDto;
import com.marcelmalewski.miruhqapi.mal.dto.AnimeDtoMapper;
import com.marcelmalewski.miruhqapi.mal.dtorest.AnimeListDtoRest;
import com.marcelmalewski.miruhqapi.mal.dtorest.AnimeListNodeDtoRest;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class MalPrincipalAnimeService {

    private final RestClient malApiPrincipalClient;
    private final AnimeDtoMapper animeDtoMapper;

    public MalPrincipalAnimeService(
        @Qualifier("malApiPrincipalClient") RestClient malApiPrincipalClient,
        AnimeDtoMapper animeDtoMapper
    ) {
        this.malApiPrincipalClient = malApiPrincipalClient;
        this.animeDtoMapper = animeDtoMapper;
    }

    @Cacheable(
        value = "principal-anime",
        key = "#username + ':' + #sortField"
    )
    public List<AnimeDto> findAllPrincipalAnime(
        String username,
        String token,
        String sortField
    ) {
        return fetchAllPrincipalAnime(token, sortField);
    }

    @CachePut(
        value = "principal-anime",
        key = "#username + ':' + #sortField"
    )
    public List<AnimeDto> refreshAllPrincipalAnime(
        String username,
        String token,
        String sortField
    ) {
        return fetchAllPrincipalAnime(token, sortField);
    }

    private List<AnimeDto> fetchAllPrincipalAnime(
        String token,
        String sortField
    ) {
        final var allPrincipalAnime = new ArrayList<AnimeDto>();
        final int limit = 1000;
        int offset = 0;

        while (true) {
            final int currentOffset = offset;

            final AnimeListDtoRest response = malApiPrincipalClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path("/users/@me/animelist")
                    .queryParam("fields", AnimeListNodeDtoRest.DEFAULT_FIELDS)
                    .queryParam("limit", limit)
                    .queryParam("offset", currentOffset)
                    .queryParam("sort", sortField)
                    .build())
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .body(AnimeListDtoRest.class);

            final List<AnimeDto> animeListDto = mapAnimeListDto(response);
            allPrincipalAnime.addAll(animeListDto);

            if (animeListDto.size() < limit) {
                break;
            }

            offset += limit;
        }

        return allPrincipalAnime;
    }

    private List<AnimeDto> mapAnimeListDto(AnimeListDtoRest animeListDtoRest) {
        if (animeListDtoRest == null) {
            return new ArrayList<>();
        }

        return animeListDtoRest.data().stream()
            .map(animeListDataDtoRest ->
                animeDtoMapper.toAnimeDto(
                    animeListDataDtoRest.node(),
                    animeListDataDtoRest.listStatus()
                )
            )
            .toList();
    }
}
