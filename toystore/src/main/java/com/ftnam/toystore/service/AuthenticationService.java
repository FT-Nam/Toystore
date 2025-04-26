package com.ftnam.toystore.service;

import com.ftnam.toystore.dto.request.AuthenticationRequest;
import com.ftnam.toystore.dto.request.LogoutRequest;
import com.ftnam.toystore.dto.request.RefreshRequest;
import com.ftnam.toystore.dto.response.AuthenticationResponse;
import com.ftnam.toystore.dto.response.ExchangeTokenResponse;
import com.ftnam.toystore.dto.response.UserResponse;
import com.nimbusds.jose.JOSEException;

import java.text.ParseException;

public interface AuthenticationService {
    AuthenticationResponse authenticate(AuthenticationRequest request);

    AuthenticationResponse authenticateWithGoogle(String code);

    AuthenticationResponse authenticateWithFacebook(String code);

    AuthenticationResponse refreshToken(RefreshRequest request)  throws ParseException, JOSEException;

    void logout(LogoutRequest request) throws ParseException, JOSEException;
}
