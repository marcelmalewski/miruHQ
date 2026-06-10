package com.marcelmalewski.miruhqapi.mal.dto;

public record RelatedAnimeDto(
    Long id,
    String title,
    MainPictureDto mainPicture,
    String relationTypeFormatted
) {

}
