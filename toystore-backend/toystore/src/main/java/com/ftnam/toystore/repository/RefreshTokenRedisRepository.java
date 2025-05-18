package com.ftnam.toystore.repository;

import com.ftnam.toystore.entity.RefreshTokenRedis;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;

public interface RefreshTokenRedisRepository extends CrudRepository<RefreshTokenRedis, Long> {
    Optional<RefreshTokenRedis> findByUsername(String username);
    void deleteByUsername(String username);
}
