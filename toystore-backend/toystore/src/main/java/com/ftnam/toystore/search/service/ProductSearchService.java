package com.ftnam.toystore.search.service;

import com.ftnam.toystore.entity.Product;
import com.ftnam.toystore.search.dto.request.ProductFilterRequest;
import com.ftnam.toystore.search.dto.request.ProductTypeRequest;
import com.ftnam.toystore.search.dto.response.ProductSearchResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductSearchService {
    void saveProduct(Product product);

    Page<ProductSearchResponse> searchByName(String name, Pageable pageable);

    Page<ProductSearchResponse> productFilter(ProductFilterRequest request, Pageable pageable);

    Page<ProductSearchResponse> getProductByType(ProductTypeRequest request, Pageable pageable);
}
