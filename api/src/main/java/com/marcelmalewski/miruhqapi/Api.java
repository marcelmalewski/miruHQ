package com.marcelmalewski.miruhqapi;

import com.marcelmalewski.miruhqapi.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class Api {

    public static void main(String[] args) {
        SpringApplication.run(Api.class, args);
    }

}
