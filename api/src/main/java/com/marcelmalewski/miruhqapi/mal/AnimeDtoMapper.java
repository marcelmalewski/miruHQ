package com.marcelmalewski.miruhqapi.mal;

import com.marcelmalewski.miruhqapi.mal.dto.AnimeDtoRest;
import com.marcelmalewski.miruhqapi.mal.dto.AnimeDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AnimeDtoMapper {
    AnimeDto toAnimeDto(AnimeDtoRest animeDtoRest);
}
