package com.marcelmalewski.miruhqapi.mal.dto;

public record AnimeDto(Long id, String title, String startDate, Integer numEpisodes,
                       MainPictureDtoRest mainPicture) {

}
