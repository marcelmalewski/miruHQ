package com.marcelmalewski.miruhqapi.mal.dtorest;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.marcelmalewski.miruhqapi.mal.dto.MainPictureDto;

public record RelatedAnimeNodeDtoRest(
    Long id, String title,
    @JsonProperty("main_picture")
    MainPictureDto mainPicture,
    String type
) {

}
