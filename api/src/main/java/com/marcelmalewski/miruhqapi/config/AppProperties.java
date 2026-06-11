package com.marcelmalewski.miruhqapi.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
    String oauthUrl,
    String backendUrl
) {
}
