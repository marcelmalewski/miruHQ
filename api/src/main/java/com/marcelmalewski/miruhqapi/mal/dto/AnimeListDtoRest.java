package com.marcelmalewski.miruhqapi.mal.dto;

import java.util.List;

public record AnimeListDtoRest(List<AnimeListDataDtoRest> data, PagingDtoRest paging) {

}
