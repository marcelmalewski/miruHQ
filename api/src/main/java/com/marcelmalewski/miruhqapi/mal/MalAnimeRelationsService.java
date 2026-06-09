package com.marcelmalewski.miruhqapi.mal;

import com.marcelmalewski.miruhqapi.mal.dto.AnimeDetailsDto;
import com.marcelmalewski.miruhqapi.mal.dto.AnimeDtoMapper;
import com.marcelmalewski.miruhqapi.mal.dtorest.AnimeDetailsDtoRest;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class MalAnimeRelationsService {

    private final RestClient publicApiClient;

    private final AnimeDtoMapper animeDtoMapper;

    public MalAnimeRelationsService(
        @Qualifier("malApiPublicClient") RestClient publicApiClient, AnimeDtoMapper animeDtoMapper
    ) {
        this.publicApiClient = publicApiClient;
        this.animeDtoMapper = animeDtoMapper;
    }

    @Cacheable(
        value = "anime-relations",
        key = "#animeId"
    )
    public AnimeDetailsDto findAnimeRelations(Long animeId) {
        final AnimeDetailsDtoRest result = publicApiClient.get()
            .uri(uriBuilder -> uriBuilder
                .path("/anime/{id}")
                .queryParam("fields", "related_anime")
                .build(animeId))
            .retrieve()
            .body(AnimeDetailsDtoRest.class);
        return animeDtoMapper.toAnimeDetailsDto(result);
    }
}
