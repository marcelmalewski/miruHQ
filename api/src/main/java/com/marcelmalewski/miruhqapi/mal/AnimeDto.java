package com.marcelmalewski.miruhqapi.mal;

public record AnimeDto(Long id, String title, String startDate,
                       Integer numEpisodes, MainPicture mainPicture) {

}
