package com.marcelmalewski.miruhqapi.mal.dtorest;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RelatedAnimeDtoRest(
    RelatedAnimeNodeDtoRest node,

    @JsonProperty("relation_type")
    String relationType,

    @JsonProperty("relation_type_formatted")
    String relationTypeFormatted
) {

}
