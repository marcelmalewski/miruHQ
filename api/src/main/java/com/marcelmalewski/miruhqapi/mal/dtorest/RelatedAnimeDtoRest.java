package com.marcelmalewski.miruhqapi.mal.dtorest;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record RelatedAnimeDtoRest(
    RelatedAnimeNodeDtoRest node,

    @JsonProperty("relation_type")
    String relationType,

    @JsonProperty("relation_type_formatted")
    String relationTypeFormatted
) {
    public static List<String> IGNORED_RELATION_TYPES = List.of("other", "character");
}
