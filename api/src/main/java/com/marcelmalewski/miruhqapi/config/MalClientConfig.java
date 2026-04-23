package com.marcelmalewski.miruhqapi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class MalClientConfig {

    public static final String MAL_URL_BASE = "https://myanimelist.net/";

    @Value("${mal.client-id}")
    private String clientId;

    @Bean
    RestClient malV1Client() {
        return RestClient.builder()
            .baseUrl(MAL_URL_BASE + "v1")
            .build();
    }

    @Bean
    RestClient malPublicClient() {
        return baseMalV2Builder()
            .defaultHeader("X-MAL-CLIENT-ID", clientId)
            .build();
    }

    @Bean
    RestClient malPrincipalClient() {
        return baseMalV2Builder()
            .build();
    }

    private RestClient.Builder baseMalV2Builder() {
        return RestClient.builder()
            .baseUrl(MAL_URL_BASE + "v2");
    }
}
