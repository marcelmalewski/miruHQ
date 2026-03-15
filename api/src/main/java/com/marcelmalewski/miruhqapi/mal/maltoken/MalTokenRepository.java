package com.marcelmalewski.miruhqapi.mal.maltoken;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MalTokenRepository extends JpaRepository<MalToken, Long> {
    Optional<MalToken> findByUsername(String username);
}
