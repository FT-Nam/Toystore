package com.ftnam.toystore.controller;

import com.ftnam.toystore.dto.request.ProductImgCreationRequest;
import com.ftnam.toystore.dto.request.ProductImgUpdateRequest;
import com.ftnam.toystore.dto.response.ApiResponse;
import com.ftnam.toystore.dto.response.PaginationInfo;
import com.ftnam.toystore.dto.response.ProductImgResponse;
import com.ftnam.toystore.service.impl.ProductImgServiceImpl;
import com.ftnam.toystore.service.impl.ProductServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product-img")
@RequiredArgsConstructor
public class ProductImgController {
    private final ProductImgServiceImpl productService;

    @PostMapping
    ApiResponse<ProductImgResponse> createProductImg(@RequestBody @Valid ProductImgCreationRequest request){
        return ApiResponse.<ProductImgResponse>builder()
                .message("Create product image successfully")
                .value(productService.createProductImg(request))
                .build();
    }

    @GetMapping
    ApiResponse<List<ProductImgResponse>> getAllProductImg(Pageable pageable){
        Page<ProductImgResponse> productImgResponsePage = productService.getAllProductImg(pageable);
        return ApiResponse.<List<ProductImgResponse>>builder()
                .value(productImgResponsePage.getContent())
                .pagination(PaginationInfo.builder()
                        .page(productImgResponsePage.getNumber())
                        .size(productImgResponsePage.getSize())
                        .totalElements(productImgResponsePage.getTotalElements())
                        .build())
                .build();
    }

    @GetMapping("/product/{productId}")
    ApiResponse<List<ProductImgResponse>> getProductImgByProduct(@PathVariable Long productId){
        return ApiResponse.<List<ProductImgResponse>>builder()
                .value(productService.getImagesByProductId(productId))
                .build();
    }

    @PutMapping("/{id}")
    ApiResponse<ProductImgResponse> updateProductImg(@PathVariable Long id, @RequestBody ProductImgUpdateRequest request){
        return ApiResponse.<ProductImgResponse>builder()
                .value(productService.updateProductImg(id,request))
                .message("Update product image successfully")
                .build();
    }

    @DeleteMapping("/{id}")
    ApiResponse<Void> deleteProductImg(@PathVariable Long id){
        productService.deleteProductImg(id);
        return ApiResponse.<Void>builder()
                .message("Delete product image successfully")
                .build();
    }
}
