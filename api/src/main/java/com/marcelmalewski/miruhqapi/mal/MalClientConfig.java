package com.marcelmalewski.miruhqapi.mal;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class MalClientConfig {

    // TODO wywal do env jak spushuje to skasuj client id oraz stwórz nowe
    @Bean
    RestClient malRestClient() {
        return RestClient.builder()
            .baseUrl("https://api.myanimelist.net/v2")
            .defaultHeader("X-MAL-CLIENT-ID", "15082b2f3acc8731291f215237399e87")
            .build();
    }
}
