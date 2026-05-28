package com.marcelmalewski.miruhqapi.mal.dtorest;

import com.marcelmalewski.miruhqapi.mal.dto.PagingDtoRest;
import java.util.List;

public record AnimeListDtoRest(List<AnimeListDataDtoRest> data, PagingDtoRest paging) {

}
