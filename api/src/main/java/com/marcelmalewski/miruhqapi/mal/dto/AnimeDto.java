package com.marcelmalewski.miruhqapi.mal.dto;

import java.util.List;

public record AnimeDto(Long id, String title, String startDate, Integer numEpisodes,
                       MainPictureDto mainPicture, List<RelatedAnimeDto> missingTitles) {

}
