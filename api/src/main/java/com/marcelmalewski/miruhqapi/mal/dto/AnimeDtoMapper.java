package com.marcelmalewski.miruhqapi.mal.dto;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AnimeDtoMapper {
    AnimeDto toAnimeDto(AnimeDtoRest animeDtoRest);
}
