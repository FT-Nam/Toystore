package com.ftnam.toystore.controller;

import com.ftnam.toystore.dto.request.PaymentRequest;
import com.ftnam.toystore.dto.response.ApiResponse;
import com.ftnam.toystore.dto.response.PaymentResponse;
import com.ftnam.toystore.service.impl.PaymentServiceImpl;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payments")
public class PaymentController {
    private final PaymentServiceImpl paymentService;

    @PostMapping
    ApiResponse<String> createPayment(@RequestBody PaymentRequest request, HttpServletRequest httpServletRequest) throws UnsupportedEncodingException {
        return ApiResponse.<String>builder()
                .message("Success")
                .value(paymentService.createPayment(request, httpServletRequest))
                .build();
    }

    @GetMapping("/payment-callback")
    public ApiResponse<String> returnPayment(HttpServletRequest request) {
        int result = paymentService.orderReturn(request);

        // Xử lý kết quả trả về từ paymentService
        if (result == 1) {
            return ApiResponse.<String>builder()
                    .message("Payment successful")
                    .build();
        } else if (result == 0) {
            return ApiResponse.<String>builder()
                    .message("Payment failed")
                    .build();
        } else {
            return ApiResponse.<String>builder()
                    .message("Invalid signature")
                    .build();
        }
    }
}
