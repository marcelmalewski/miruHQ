package com.marcelmalewski.miruhqapi.mal.dtorest;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AnimeListDataDtoRest(AnimeListNodeDtoRest node,
                                   @JsonProperty("list_status") AnimeListListStatusDtoRest listStatus) {

}
