package com.marcelmalewski.miruhqapi.mal;

import static com.marcelmalewski.miruhqapi.config.MalClientConfig.MAL_API_PRINCIPAL_URL_BASE;

import com.marcelmalewski.miruhqapi.mal.dto.AnimeDto;
import com.marcelmalewski.miruhqapi.mal.dto.AnimeDtoMapper;
import com.marcelmalewski.miruhqapi.mal.dtorest.AnimeListDtoRest;
import com.marcelmalewski.miruhqapi.mal.dtorest.AnimeListNodeDtoRest;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.CacheEvict;
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

    public List<AnimeDto> findPrincipalAnimeList(String token, Integer limit, Integer offset,
        String status, String sortField) {
        final var response = malApiPrincipalClient.get()
            .uri(uriBuilder -> uriBuilder.path(MAL_API_PRINCIPAL_URL_BASE + "/animelist")
                .queryParam("fields", AnimeListNodeDtoRest.DEFAULT_FIELDS)
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

    @Cacheable(
        value = "principal-anime",
        key = "#username"
    )
    public List<AnimeDto> findAllPrincipalAnime(
        String username,
        String token
    ) {
        final var allPrincipalAnime = new ArrayList<AnimeDto>();
        final int limit = 1000;
        int offset = 0;

        while (true) {
            final int currentOffset = offset;

            final AnimeListDtoRest response = malApiPrincipalClient.get()
                .uri(uriBuilder -> uriBuilder
                    .path(MAL_API_PRINCIPAL_URL_BASE + "/animelist")
                    .queryParam("fields", AnimeListNodeDtoRest.DEFAULT_FIELDS+",media_type")
                    .queryParam("limit", limit)
                    .queryParam("offset", currentOffset)
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

    @CacheEvict(
        value = "principal-anime",
        key = "#username"
    )
    public void evictPrincipalAnime(String username) {
        // Spring handles the eviction
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
