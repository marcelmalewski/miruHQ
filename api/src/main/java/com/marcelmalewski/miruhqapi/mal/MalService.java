package com.marcelmalewski.miruhqapi.mal;

import com.marcelmalewski.miruhqapi.mal.dto.AnimeDto;
import com.marcelmalewski.miruhqapi.mal.dto.AnimeDtoMapper;
import com.marcelmalewski.miruhqapi.mal.dto.PrincipalInfoDto;
import com.marcelmalewski.miruhqapi.mal.dto.RelatedAnimeDto;
import com.marcelmalewski.miruhqapi.mal.dtorest.AnimeListDtoRest;
import com.marcelmalewski.miruhqapi.mal.dtorest.AnimeListNodeDtoRest;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class MalService {

    private final RestClient publicApiClient;
    private final RestClient malApiPrincipalClient;
    private final AnimeDtoMapper animeDtoMapper;
    private final MalAnimeRelationsService malAnimeRelationsService;
    private final MalPrincipalAnimeService malPrincipalAnimeService;

    public MalService(@Qualifier("malApiPublicClient") RestClient publicApiClient,
        @Qualifier("malApiPrincipalClient") RestClient malApiPrincipalClient,
        AnimeDtoMapper animeDtoMapper, MalAnimeRelationsService malAnimeRelationsService,
        MalPrincipalAnimeService malPrincipalAnimeService) {
        this.publicApiClient = publicApiClient;
        this.malApiPrincipalClient = malApiPrincipalClient;
        this.animeDtoMapper = animeDtoMapper;
        this.malAnimeRelationsService = malAnimeRelationsService;
        this.malPrincipalAnimeService = malPrincipalAnimeService;
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

    protected List<AnimeDto> findPrincipalMissingTitles(
        String token,
        int limit,
        int offset,
        String status,
        String sortField
    ) {
        final var principalInfo = getPrincipalInfo(token);
        final List<AnimeDto> principalAnimeList = malPrincipalAnimeService.getAllPrincipalAnime(
            principalInfo.name(), token, sortField);

        final var principalAnimeListIds = principalAnimeList.stream()
            .map(AnimeDto::id)
            .collect(Collectors.toSet());
        final var principalAnimeListFilteredByStatus = principalAnimeList.stream()
            .filter(animeDto -> Objects.equals(
                animeDto.status(), status)).toList();

        final List<AnimeDto> animeWithMissingTitles = new ArrayList<>();
        for (AnimeDto animeDto : principalAnimeListFilteredByStatus) {
            final var animeDetailsDtoRest = malAnimeRelationsService.findAnimeRelations(
                animeDto.id());

            final List<RelatedAnimeDto> missingTitles = Objects.requireNonNull(animeDetailsDtoRest)
                .relatedAnime().stream()
                .filter(relatedAnimeDtoRest -> principalAnimeListIds.contains(
                    relatedAnimeDtoRest.node().id()) == false &&
                    relatedAnimeDtoRest.relationType().equals("other") == false
                        && relatedAnimeDtoRest.relationType().equals("summary") == false && relatedAnimeDtoRest.relationType().equals("character") == false)
                .map(relatedAnimeDtoRest -> new RelatedAnimeDto(
                    relatedAnimeDtoRest.node().id(),
                    relatedAnimeDtoRest.node().title(),
                    relatedAnimeDtoRest.node().mainPicture(),
                    relatedAnimeDtoRest.relationTypeFormatted()
                ))
                .toList();
            if (missingTitles.isEmpty()) {
                continue;
            }

            animeWithMissingTitles.add(
                new AnimeDto(
                    animeDto.id(),
                    animeDto.title(),
                    animeDto.startDate(),
                    animeDto.numEpisodes(),
                    animeDto.mainPicture(),
                    animeDto.status(),
                    missingTitles
                )
            );

            if (animeWithMissingTitles.size() >= offset + limit) {
                break;
            }
        }

        return animeWithMissingTitles.stream()
            .skip(offset)
            .limit(limit)
            .toList();
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
