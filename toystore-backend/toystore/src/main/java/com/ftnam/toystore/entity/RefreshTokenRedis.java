package com.ftnam.toystore.entity;

import jakarta.persistence.Entity;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;
import org.springframework.data.redis.core.index.Indexed;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@RedisHash("refresh_token")
public class RefreshTokenRedis implements Serializable {
    @Id
    Long id;

    String token;

    @TimeToLive
    private long expirationTime;
}
