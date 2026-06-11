package com.marcelmalewski.miruhqapi.mal;

import com.marcelmalewski.miruhqapi.mal.dto.AnimeDto;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class MalMissingTitlesService {

    private static final String CACHE_NAME = "missing-titles";

    @Cacheable(
        value = CACHE_NAME,
        key = "#username + ':' + #status + ':' + #sortField + ':' + #relationTypes"
    )
    public CachedMissingTitles getCachedMissingTitles(
        String username,
        String status,
        String sortField,
        String relationTypes
    ) {
        return new CachedMissingTitles(
            0,
            List.of()
        );
    }

    @CachePut(
        value = CACHE_NAME,
        key = "#username + ':' + #status + ':' + #sortField + ':' + #relationTypes"
    )
    public CachedMissingTitles cacheMissingTitles(
        String username,
        String status,
        String sortField,
        String relationTypes,
        CachedMissingTitles missingTitlesToCache
    ) {
        return missingTitlesToCache;
    }

    @CacheEvict(
        value = CACHE_NAME,
        allEntries = true
    )
    public void evictAllProgress() {
        // Spring handles the eviction
    }

    public record CachedMissingTitles(
        int scannedIndex,
        List<AnimeDto> missingTitles
    ) {
        public CachedMissingTitles {
            missingTitles = List.copyOf(missingTitles);
        }
    }

    public static String prepareRelationTypesCacheKey(List<String> relationTypes) {
        if (relationTypes == null || relationTypes.isEmpty()) {
            return "all";
        }

        return relationTypes.stream()
            .sorted()
            .collect(Collectors.joining(","));
    }
}
