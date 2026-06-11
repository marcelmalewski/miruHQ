package com.marcelmalewski.miruhqapi.mal;

import static com.marcelmalewski.miruhqapi.config.MalClientConfig.MAL_API_PRINCIPAL_URL_BASE;

import com.marcelmalewski.miruhqapi.mal.MalMissingTitlesService.CachedMissingTitles;
import com.marcelmalewski.miruhqapi.mal.dto.AnimeDto;
import com.marcelmalewski.miruhqapi.mal.dto.AnimeDtoMapper;
import com.marcelmalewski.miruhqapi.mal.dto.PrincipalInfoDto;
import com.marcelmalewski.miruhqapi.mal.dto.RelatedAnimeDto;
import com.marcelmalewski.miruhqapi.mal.dtorest.AnimeListDtoRest;
import com.marcelmalewski.miruhqapi.mal.dtorest.AnimeListNodeDtoRest;
import java.util.ArrayList;
import java.util.Comparator;
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
    private final MalMissingTitlesService malMissingTitlesService;

    public MalService(@Qualifier("malApiPublicClient") RestClient publicApiClient,
        @Qualifier("malApiPrincipalClient") RestClient malApiPrincipalClient,
        AnimeDtoMapper animeDtoMapper, MalAnimeRelationsService malAnimeRelationsService,
        MalPrincipalAnimeService malPrincipalAnimeService,
        MalMissingTitlesService malMissingTitlesService) {
        this.publicApiClient = publicApiClient;
        this.malApiPrincipalClient = malApiPrincipalClient;
        this.animeDtoMapper = animeDtoMapper;
        this.malAnimeRelationsService = malAnimeRelationsService;
        this.malPrincipalAnimeService = malPrincipalAnimeService;
        this.malMissingTitlesService = malMissingTitlesService;
    }

    protected PrincipalInfoDto getPrincipalInfo(String token) {
        return malApiPrincipalClient.get()
            .uri(uriBuilder -> uriBuilder.path(MAL_API_PRINCIPAL_URL_BASE).build())
            .header("Authorization", "Bearer " + token).retrieve()
            .body(PrincipalInfoDto.class);
    }

    protected List<AnimeDto> findPrincipalAnimeList(String token, Integer limit, Integer offset,
        String status, String sortField) {
        return malPrincipalAnimeService.findPrincipalAnimeList(token, limit, offset, status,
            sortField);
    }

    protected List<AnimeDto> findPrincipalMissingTitles(
        String token,
        int limit,
        int offset,
        String status,
        String sortField,
        Boolean refreshPrincipalAnime,
        Boolean refreshAnimeRelations
    ) {
        final var principalInfo = getPrincipalInfo(token);

        if (Boolean.TRUE.equals(refreshPrincipalAnime)) {
            malPrincipalAnimeService.evictPrincipalAnime(principalInfo.name());
            malMissingTitlesService.evictAllProgress();
        }
        if (Boolean.TRUE.equals(refreshAnimeRelations)) {
            malAnimeRelationsService.evictAllAnimeRelations();
            malMissingTitlesService.evictAllProgress();
        }

        final List<AnimeDto> principalAnimeList = malPrincipalAnimeService.findAllPrincipalAnime(
            principalInfo.name(),
            token
        );
        final var principalAnimeListIds = principalAnimeList.stream()
            .map(AnimeDto::id)
            .collect(Collectors.toSet());
        final var principalAnimeListFilteredByStatus =
            sortAnime(
                principalAnimeList.stream()
                    .filter(animeDto -> Objects.equals(animeDto.status(), status))
                    .toList(),
                sortField
            );

        final var cachedMissingTitles = malMissingTitlesService.getCachedMissingTitles(
            principalInfo.name(), status, sortField);

        final List<AnimeDto> animeWithMissingTitles = new ArrayList<>(
            cachedMissingTitles.missingTitles());
        if (animeWithMissingTitles.size() >= offset + limit) {
            return animeWithMissingTitles.stream()
                .skip(offset)
                .limit(limit)
                .toList();
        }

        int index = cachedMissingTitles.scannedIndex();
        for (; index < principalAnimeListFilteredByStatus.size(); index++) {
            AnimeDto animeDto = principalAnimeListFilteredByStatus.get(index);
            final var animeDetailsDto = malAnimeRelationsService.findAnimeRelations(animeDto.id());

            final List<RelatedAnimeDto> missingTitles = Objects.requireNonNull(animeDetailsDto)
                .relatedAnime().stream()
                .filter(relatedAnimeDtoRest -> principalAnimeListIds.contains(
                    relatedAnimeDtoRest.node().id()) == false &&
                    relatedAnimeDtoRest.relationType().equals("other") == false
                    && relatedAnimeDtoRest.relationType().equals("summary") == false
                    && relatedAnimeDtoRest.relationType().equals("character") == false)
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
                    missingTitles,
                    animeDto.score(),
                    animeDto.updatedAt()
                )
            );

            if (animeWithMissingTitles.size() >= offset + limit) {
                index++;
                break;
            }
        }

        malMissingTitlesService.cacheMissingTitles(
            principalInfo.name(),
            status,
            sortField,
            new CachedMissingTitles(
                index,
                animeWithMissingTitles
            )
        );

        return animeWithMissingTitles.stream()
            .skip(offset)
            .limit(limit)
            .toList();
    }

    private List<AnimeDto> sortAnime(
        List<AnimeDto> animeDtoList,
        String sortField
    ) {
        List<AnimeDto> animeDtoListSorted = new ArrayList<>(animeDtoList);

        switch (sortField) {
            case "list_score" -> animeDtoListSorted.sort(
                Comparator.comparing(
                    AnimeDto::score,
                    Comparator.nullsLast(Integer::compareTo)
                ).reversed()
            );
            case "list_updated_at" -> animeDtoListSorted.sort(
                Comparator.comparing(
                    AnimeDto::updatedAt,
                    Comparator.nullsLast(String::compareTo)
                ).reversed()
            );
            case "anime_title" -> animeDtoListSorted.sort(
                Comparator.comparing(
                    AnimeDto::title,
                    Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)
                )
            );

            case "anime_start_date" -> animeDtoListSorted.sort(
                Comparator.comparing(
                    AnimeDto::startDate,
                    Comparator.nullsLast(String::compareTo)
                ).reversed()
            );
        }

        return animeDtoListSorted;
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
