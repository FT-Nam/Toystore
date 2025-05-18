package com.ftnam.toystore.repository;

import com.ftnam.toystore.dto.request.ExchangeTokenRequest;
import com.ftnam.toystore.dto.response.ExchangeTokenResponse;
import feign.QueryMap;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;

//@QueryMap chỉ dùng để truyền các tham số vào URL dạng ?key=value.
@FeignClient(name = "google-oauth", url = "https://oauth2.googleapis.com")
public interface GoogleOAuthClient {
    @PostMapping(value = "/token", produces = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    ExchangeTokenResponse exchangeToken(@QueryMap ExchangeTokenRequest request);
}
