package com.marcelmalewski.miruhqapi.mal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AnimeDto(Long id, String title,
                       @JsonProperty("start_date")
                       String startDate,
                       @JsonProperty("num_episodes")
                       Integer numEpisodes,
                       @JsonProperty("main_picture")
                       MainPictureDto mainPicture) {
}
