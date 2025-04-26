package com.ftnam.toystore.service;

import com.ftnam.toystore.dto.request.ProductCreationRequest;
import com.ftnam.toystore.dto.request.ProductUpdateRequest;
import com.ftnam.toystore.dto.response.ProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductResponse createProduct(ProductCreationRequest request);

    Page<ProductResponse> getAllProduct(Pageable pageable);

    Page<ProductResponse> getProductsByCategoryId(Long CategoryId, Pageable pageable);

    ProductResponse getProductById(Long id);

    ProductResponse updateProduct(Long id, ProductUpdateRequest request);

    void deleteProduct(Long id);
}
