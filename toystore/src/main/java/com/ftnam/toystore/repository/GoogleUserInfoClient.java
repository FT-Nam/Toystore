package com.ftnam.toystore.repository;

import com.ftnam.toystore.dto.response.GoogleUserInfoResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "google-userinfo", url = "https://www.googleapis.com")
public interface GoogleUserInfoClient {
    @GetMapping("/oauth2/v2/userinfo")
    GoogleUserInfoResponse getUserInfo(@RequestHeader("Authorization") String bearerToken);
}
