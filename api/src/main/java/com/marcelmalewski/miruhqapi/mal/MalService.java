package com.marcelmalewski.miruhqapi.mal;

import com.marcelmalewski.miruhqapi.mal.dtorest.AnimeDetailsDtoRest;
import com.marcelmalewski.miruhqapi.mal.dto.AnimeDto;
import com.marcelmalewski.miruhqapi.mal.dto.AnimeDtoMapper;
import com.marcelmalewski.miruhqapi.mal.dtorest.AnimeListDtoRest;
import com.marcelmalewski.miruhqapi.mal.dtorest.AnimeListNodeDtoRest;
import com.marcelmalewski.miruhqapi.mal.dto.PrincipalInfoDto;
import com.marcelmalewski.miruhqapi.mal.dtorest.RelatedAnimeDtoRest;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
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

    protected PrincipalInfoDto getPrincipalInfo(String token) {
        return malApiPrincipalClient.get().uri(uriBuilder -> uriBuilder.path("/users/@me").build())
            .header("Authorization", "Bearer " + token).retrieve()
            .body(PrincipalInfoDto.class);
    }

    protected List<AnimeDto> findPrincipalAnimeList(String token, Integer limit, Integer offset,
        String status, String sortField) {
        final var response = malApiPrincipalClient.get()
            .uri(uriBuilder -> uriBuilder.path("/users/@me/animelist")
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


    protected List<AnimeDto> findPrincipalAnimeListWithMissingTitles(
        String token
    ) {
        final List<AnimeDto> principalAnimeList = getAllPrincipalAnime(token);
        final var principalAnimeIds = principalAnimeList.stream()
            .map(AnimeDto::id)
            .collect(java.util.stream.Collectors.toSet());

        return principalAnimeList.stream()
            .map(anime ->
                publicApiClient.get()
                    .uri(uriBuilder -> uriBuilder
                        .path("/anime/{id}")
                        .queryParam("fields", "related_anime")
                        .build(anime.id()))
                    .retrieve()
                    .body(AnimeDetailsDtoRest.class)
            )
            .filter(Objects::nonNull)
            .flatMap(animeDetails -> animeDetails.relatedAnime().stream())
            .map(RelatedAnimeDtoRest::node)
            .filter(node -> !principalAnimeIds.contains(node.id()))
            .map(animeDtoMapper::toAnimeDto)
            .toList();
    }

    private List<AnimeDto> getAllPrincipalAnime(
        String token
    ) {
        final var allPrincipalAnime = new ArrayList<AnimeDto>();
        final int limit = 1000;
        int offset = 0;

        while (true) {
            int currentOffset = offset;
            final var response = malApiPrincipalClient.get()
                .uri(uriBuilder -> uriBuilder.path("/users/@me/animelist")
                    .queryParam("fields", "id")
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


    protected List<AnimeDto> findAnime(Integer limit, Integer offset, String title) {
        final var response = publicApiClient.get()
            .uri(uriBuilder -> uriBuilder.path("/anime")
                .queryParam("fields", AnimeListNodeDtoRest.DEFAULT_FIELDS)
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
