package com.ftnam.toystore.search.controller;

import com.ftnam.toystore.dto.response.ApiResponse;
import com.ftnam.toystore.search.dto.response.ProductSearchResponse;
import com.ftnam.toystore.search.service.impl.ProductSearchServiceImpl;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/search/product")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductSearchController {
    ProductSearchServiceImpl productSearchService;

    @GetMapping
    public ApiResponse<List<ProductSearchResponse>> searchByName(@RequestParam String name){
        return ApiResponse.<List<ProductSearchResponse>>builder()
                .value(productSearchService.searchByName(name))
                .build();
    }
}
