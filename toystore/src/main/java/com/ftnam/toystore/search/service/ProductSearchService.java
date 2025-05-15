package com.ftnam.toystore.search.service;

import com.ftnam.toystore.entity.Product;
import com.ftnam.toystore.search.dto.response.ProductSearchResponse;

import java.util.List;

public interface ProductSearchService {
    void saveProduct(Product product);

    List<ProductSearchResponse> searchByName(String name);
}
