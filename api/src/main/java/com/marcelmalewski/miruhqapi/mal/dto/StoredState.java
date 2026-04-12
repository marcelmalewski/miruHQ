package com.marcelmalewski.miruhqapi.mal.dto;

import java.time.Instant;

public record StoredState(String codeVerifier, Instant createdAt) {}
