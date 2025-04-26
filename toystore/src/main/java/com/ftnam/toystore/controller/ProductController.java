package com.ftnam.toystore.controller;

import com.ftnam.toystore.dto.request.ProductCreationRequest;
import com.ftnam.toystore.dto.request.ProductUpdateRequest;
import com.ftnam.toystore.dto.response.ApiResponse;
import com.ftnam.toystore.dto.response.PaginationInfo;
import com.ftnam.toystore.dto.response.ProductResponse;
import com.ftnam.toystore.service.impl.ProductServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/product")
public class ProductController {
    private final ProductServiceImpl productService;

    @PostMapping
    public ApiResponse<ProductResponse> createProduct(@RequestBody ProductCreationRequest request){
        return ApiResponse.<ProductResponse>builder()
                .message("Create product has been successfully")
                .value(productService.createProduct(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<ProductResponse>> getAllProduct(Pageable pageable){
        Page<ProductResponse> productResponsePage = productService.getAllProduct(pageable);
        return ApiResponse.<List<ProductResponse>>builder()
                .value(productResponsePage.getContent())
                .pagination(PaginationInfo.builder()
                        .page(productResponsePage.getNumber())
                        .size(productResponsePage.getSize())
                        .totalElements(productResponsePage.getTotalElements())
                        .build())
                .build();
    }

    @GetMapping("/category/{categoryId}")
    public ApiResponse<List<ProductResponse>> getProductsByCategoryId(@PathVariable Long categoryId, Pageable pageable){
        Page<ProductResponse> productResponsePage = productService.getProductsByCategoryId(categoryId, pageable);
        return ApiResponse.<List<ProductResponse>>builder()
                .value(productResponsePage.getContent())
                .pagination(PaginationInfo.builder()
                        .page(productResponsePage.getNumber())
                        .size(productResponsePage.getSize())
                        .totalElements(productResponsePage.getTotalElements())
                        .build())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getProductById(@PathVariable Long id){
        return ApiResponse.<ProductResponse>builder()
                .value(productService.getProductById(id))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> updateProduct(@PathVariable Long id, @RequestBody @Valid ProductUpdateRequest request){
        return ApiResponse.<ProductResponse>builder()
                .message("Update product has been successfully")
                .value(productService.updateProduct(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<ProductResponse> deleteProduct(@PathVariable Long id){
        productService.deleteProduct(id);
        return ApiResponse.<ProductResponse>builder()
                .message("Delete product has been successfully")
                .build();
    }
}
