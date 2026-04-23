package com.marcelmalewski.miruhqapi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class MalClientConfig {

    public static final String MAL_URL_BASE = "https://myanimelist.net/";
    public static final String MAL_API_URL_BASE = "https://api.myanimelist.net/v2";

    @Value("${mal.client-id}")
    private String clientId;

    @Bean
    RestClient malV1Client() {
        return RestClient.builder()
            .baseUrl(MAL_URL_BASE + "v1")
            .build();
    }

    @Bean
    RestClient malApiPublicClient() {
        return baseMalApiV2Builder()
            .defaultHeader("X-MAL-CLIENT-ID", clientId)
            .build();
    }

    @Bean
    RestClient malApiPrincipalClient() {
        return baseMalApiV2Builder()
            .build();
    }

    private RestClient.Builder baseMalApiV2Builder() {
        return RestClient.builder()
            .baseUrl(MAL_API_URL_BASE);
    }
}
