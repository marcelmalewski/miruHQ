package com.marcelmalewski.miruhqapi.mal.dtorest;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record AnimeDetailsDtoRest(
    @JsonProperty("related_anime")
    List<RelatedAnimeDtoRest> relatedAnime
) {
}
