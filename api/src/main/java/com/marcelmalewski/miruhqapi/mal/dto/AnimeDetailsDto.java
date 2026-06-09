package com.marcelmalewski.miruhqapi.mal.dto;

import com.marcelmalewski.miruhqapi.mal.dtorest.RelatedAnimeDtoRest;
import java.util.List;

public record AnimeDetailsDto(
    List<RelatedAnimeDtoRest> relatedAnime
) {
}
