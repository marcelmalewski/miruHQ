package com.marcelmalewski.miruhqapi.mal.dto;

import com.marcelmalewski.miruhqapi.mal.dtorest.AnimeListNodeDtoRest;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AnimeDtoMapper {

    AnimeDto toAnimeDto(AnimeListNodeDtoRest animeListNodeDtoRest);
}
