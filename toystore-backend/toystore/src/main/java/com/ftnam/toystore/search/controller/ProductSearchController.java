package com.ftnam.toystore.search.controller;

import com.ftnam.toystore.dto.response.ApiResponse;
import com.ftnam.toystore.dto.response.PaginationInfo;
import com.ftnam.toystore.search.dto.request.ProductFilterRequest;
import com.ftnam.toystore.search.dto.request.ProductTypeRequest;
import com.ftnam.toystore.search.dto.response.ProductSearchResponse;
import com.ftnam.toystore.search.service.impl.ProductSearchServiceImpl;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/search/product")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductSearchController {
    ProductSearchServiceImpl productSearchService;

    @GetMapping
    public ApiResponse<List<ProductSearchResponse>> searchByName(@RequestParam String name, Pageable pageable){
        Page<ProductSearchResponse> productSearchResponses = productSearchService.searchByName(name,pageable);
        return ApiResponse.<List<ProductSearchResponse>>builder()
                .pagination(PaginationInfo.builder()
                        .page(productSearchResponses.getNumber())
                        .totalElements(productSearchResponses.getTotalElements())
                        .size(productSearchResponses.getSize())
                        .build())
                .value(productSearchResponses.getContent())
                .build();
    }

    @GetMapping("/filter")
    public ApiResponse<List<ProductSearchResponse>> productFilter(@ModelAttribute ProductFilterRequest request, Pageable pageable){
        Page<ProductSearchResponse> productSearchResponses = productSearchService.productFilter(request,pageable);
        return ApiResponse.<List<ProductSearchResponse>>builder()
                .value(productSearchResponses.getContent())
                .pagination(PaginationInfo.builder()
                        .size(productSearchResponses.getSize())
                        .page(productSearchResponses.getNumber())
                        .totalElements(productSearchResponses.getTotalElements())
                        .build())
                .build();
    }

    @GetMapping("/type")
    public ApiResponse<List<ProductSearchResponse>> productFilter(@ModelAttribute ProductTypeRequest request, Pageable pageable){
        Page<ProductSearchResponse> productSearchResponses = productSearchService
                .getProductByType(request,pageable);
        return ApiResponse.<List<ProductSearchResponse>>builder()
                .value(productSearchResponses.getContent())
                .pagination(PaginationInfo.builder()
                        .size(productSearchResponses.getSize())
                        .page(productSearchResponses.getNumber())
                        .totalElements(productSearchResponses.getTotalElements())
                        .build())
                .build();
    }
}
