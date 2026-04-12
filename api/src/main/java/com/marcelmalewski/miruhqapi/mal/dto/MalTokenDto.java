package com.marcelmalewski.miruhqapi.mal.dto;

public record MalTokenDto(String tokenType,
                          Integer expiresIn,
                          String accessToken,
                          String refreshToken
) {

}
