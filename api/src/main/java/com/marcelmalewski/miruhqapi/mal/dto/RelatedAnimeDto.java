package com.marcelmalewski.miruhqapi.mal.dto;

public record RelatedAnimeDto(
    String title,
    MainPictureDto mainPicture,
    String relationTypeFormatted
) {

}
