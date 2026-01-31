package com.marcelmalewski.miruhqapi.mal;

import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class MalService {
    private final RestClient restClient;

    private final AnimeDtoMapper animeDtoMapper;

    public MalService(RestClient restClient, AnimeDtoMapper animeDtoMapper) {
        this.restClient = restClient;
        this.animeDtoMapper = animeDtoMapper;
    }

    public List<AnimeDto> search(AnimeSearchRequest request) {
        List<AnimeDto> animeDtos = new ArrayList<>();
        request.ids().forEach(id -> {
                AnimeMal response = restClient
                    .get()
                    .uri(uriBuilder -> uriBuilder
                        .path("/anime/{id}")
                        .queryParam(
                            "fields",
                            "id,title,main_picture,start_date,num_episodes"
                        )
                        .build(id)
                    )
                    .retrieve()
                    .body(AnimeMal.class);
                animeDtos.add(animeDtoMapper.toAnimeDto(response));
            }
        );

        return animeDtos;
    }
}
