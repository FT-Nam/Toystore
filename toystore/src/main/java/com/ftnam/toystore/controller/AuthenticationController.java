package com.ftnam.toystore.controller;

import com.ftnam.toystore.dto.request.AuthenticationRequest;
import com.ftnam.toystore.dto.request.LogoutRequest;
import com.ftnam.toystore.dto.request.RefreshRequest;
import com.ftnam.toystore.dto.response.ApiResponse;
import com.ftnam.toystore.dto.response.AuthenticationResponse;
import com.ftnam.toystore.dto.response.ExchangeTokenResponse;
import com.ftnam.toystore.dto.response.UserResponse;
import com.ftnam.toystore.service.impl.AuthenticationServiceImpl;
import com.nimbusds.jose.JOSEException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthenticationController {
    private final AuthenticationServiceImpl authenticationService;

    @PostMapping("/login/google")
    ApiResponse<AuthenticationResponse> authenticateWithGoogle(@RequestParam String code){
        return ApiResponse.<AuthenticationResponse>builder()
                .value(authenticationService.authenticateWithGoogle(code))
                .build();
    }

    @PostMapping("/login/facebook")
    ApiResponse<AuthenticationResponse> authenticateWithFacebook(@RequestParam String code){
        return ApiResponse.<AuthenticationResponse>builder()
                .value(authenticationService.authenticateWithFacebook(code))
                .build();
    }

    @PostMapping("/login")
    ApiResponse<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request){
        return ApiResponse.<AuthenticationResponse>builder()
                .value(authenticationService.authenticate(request))
                .build();
    }

    @PostMapping("/refresh")
    ApiResponse<AuthenticationResponse> refresh(@RequestBody RefreshRequest request) throws ParseException, JOSEException {
        return ApiResponse.<AuthenticationResponse>builder()
                .value(authenticationService.refreshToken(request))
                .build();
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder()
                .message("Logout has been successfully")
                .build();
    }
}
