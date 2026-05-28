package com.marcelmalewski.miruhqapi.mal;

import java.time.Instant;

public record StoredState(String codeVerifier, Instant createdAt) {}
