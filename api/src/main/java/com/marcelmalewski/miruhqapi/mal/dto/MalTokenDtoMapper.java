package com.marcelmalewski.miruhqapi.mal.dto;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface MalTokenDtoMapper {

    MalTokenDto toMalTokenDto(MalTokenDtoRest malTokenDtoRest);
}
