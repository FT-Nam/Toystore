package com.ftnam.toystore.service;

import com.ftnam.toystore.dto.request.PaymentRequest;
import com.ftnam.toystore.dto.response.PaymentResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.io.UnsupportedEncodingException;

public interface PaymentService {
    String createPayment(PaymentRequest request, HttpServletRequest httpServletRequest) throws UnsupportedEncodingException;

    int orderReturn(HttpServletRequest request);
}
