package com.marcelmalewski.miruhqapi.mal.dto;

import java.util.List;

public record AnimeListDto(List<AnimeListDataDto> data, PagingDto paging) {

}
