package com.marcelmalewski.miruhqapi.mal;

import com.marcelmalewski.miruhqapi.mal.dtorest.AnimeDetailsDtoRest;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class MalAnimeRelationsService {

    private final RestClient publicApiClient;

    public MalAnimeRelationsService(
        @Qualifier("malApiPublicClient") RestClient publicApiClient
    ) {
        this.publicApiClient = publicApiClient;
    }

    @Cacheable(
        value = "anime-relations",
        key = "#animeId"
    )
    public AnimeDetailsDtoRest findAnimeRelations(Long animeId) {
        return publicApiClient.get()
            .uri(uriBuilder -> uriBuilder
                .path("/anime/{id}")
                .queryParam("fields", "related_anime")
                .build(animeId))
            .retrieve()
            .body(AnimeDetailsDtoRest.class);
    }
}
