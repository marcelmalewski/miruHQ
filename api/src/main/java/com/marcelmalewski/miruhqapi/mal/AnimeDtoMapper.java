package com.marcelmalewski.miruhqapi.mal;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AnimeDtoMapper {
    @Mapping(source = "animeMal.start_date", target = "startDate")
    @Mapping(source = "animeMal.num_episodes", target = "numEpisodes")
    @Mapping(source = "animeMal.main_picture", target = "mainPicture")
    AnimeDto toAnimeDto(AnimeMal animeMal);
}
