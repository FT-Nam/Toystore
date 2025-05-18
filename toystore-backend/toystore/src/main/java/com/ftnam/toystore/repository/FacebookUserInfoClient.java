package com.ftnam.toystore.repository;

import com.ftnam.toystore.dto.response.FacebookUserInfoResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "facebook-userinfo", url = "https://graph.facebook.com")
public interface FacebookUserInfoClient {
    @GetMapping("/me?fields=id,name,email")
    FacebookUserInfoResponse getUserInfo(@RequestHeader("Authorization") String bearerToken);
}
