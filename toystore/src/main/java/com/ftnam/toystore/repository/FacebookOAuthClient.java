package com.ftnam.toystore.repository;

import com.ftnam.toystore.dto.request.ExchangeTokenRequest;
import com.ftnam.toystore.dto.response.ExchangeTokenResponse;
import feign.QueryMap;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;


@FeignClient(name = "facebook-oauth", url = "https://graph.facebook.com")
public interface FacebookOAuthClient {
    @PostMapping(value = "/v18.0/oauth/access_token", produces = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    ExchangeTokenResponse exchangeToken(@QueryMap ExchangeTokenRequest request);
}
