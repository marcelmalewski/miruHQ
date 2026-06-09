package com.marcelmalewski.miruhqapi.mal.dtorest;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.marcelmalewski.miruhqapi.mal.dto.MainPictureDto;

public record AnimeListNodeDtoRest(Long id, String title,
                                   @JsonProperty("start_date")
                           String startDate,
                                   @JsonProperty("num_episodes")
                           Integer numEpisodes,
                                   @JsonProperty("main_picture")
                                   MainPictureDto mainPicture) {

    public static final String DEFAULT_FIELDS = "id,title,main_picture,start_date,num_episodes,list_status";
}
