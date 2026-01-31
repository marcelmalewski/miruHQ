package com.marcelmalewski.miruhqapi.mal;

import java.util.List;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MalController {
    private final MalService malService;

    public MalController(MalService malService) {
        this.malService = malService;
    }

    @PostMapping("/api/anime/search")
    public List<AnimeDto> searchAnime(@RequestBody AnimeSearchRequest request) {
        return malService.search(request);
    }
}
