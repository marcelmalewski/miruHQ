package com.marcelmalewski.miruhqapi.mal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AnimeDtoRest(Long id, String title,
                           @JsonProperty("start_date")
                           String startDate,
                           @JsonProperty("num_episodes")
                           Integer numEpisodes,
                           @JsonProperty("main_picture")
                           MainPictureDtoRest mainPicture) {

    public static final String DEFAULT_FIELDS = "id,title,main_picture,start_date,num_episodes";
}
