package com.marcelmalewski.miruhqapi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class MalClientConfig {
    @Value("${mal.client-id}")
    private String clientId;

    @Bean
    RestClient malRestClient() {
        return RestClient.builder()
            .baseUrl("https://api.myanimelist.net/v2")
            .defaultHeader("X-MAL-CLIENT-ID", clientId)
            .build();
    }
}
