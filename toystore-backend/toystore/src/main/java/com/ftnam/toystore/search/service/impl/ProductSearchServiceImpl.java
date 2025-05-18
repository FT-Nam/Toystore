package com.ftnam.toystore.search.service.impl;

import com.ftnam.toystore.entity.Product;
import com.ftnam.toystore.search.document.ProductDocument;
import com.ftnam.toystore.search.dto.request.ProductFilterRequest;
import com.ftnam.toystore.search.dto.request.ProductTypeRequest;
import com.ftnam.toystore.search.dto.response.ProductSearchResponse;
import com.ftnam.toystore.search.mapper.ProductSearchMapper;
import com.ftnam.toystore.search.repository.ProductSearchRepository;
import com.ftnam.toystore.search.service.ProductSearchService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.client.elc.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.client.elc.NativeQuery;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductSearchServiceImpl implements ProductSearchService {
    ProductSearchRepository productSearchRepository;
    ProductSearchMapper productSearchMapper;


    @Override
    public void saveProduct(Product product) {
        ProductDocument productDocument = productSearchMapper.toProductDocument(product);
        productSearchRepository.save(productDocument);
    }

    @Override
    public Page<ProductSearchResponse> searchByName(String name, Pageable pageable) {
        return productSearchRepository.searchByName(name, pageable)
                .map(productSearchMapper::toProductSearchResponse);
    }

    @Override
    public Page<ProductSearchResponse> productFilter(ProductFilterRequest request, Pageable pageable) {
        return productSearchRepository.productFilter(
                request.getName(),
                request.isNew(),
                request.isSale(),
                request.isBestSeller(),
                request.getMinPrice(),
                request.getMaxPrice(),
                pageable
        ).map(productSearchMapper::toProductSearchResponse);
    }

    @Override
    public Page<ProductSearchResponse> getProductByType(ProductTypeRequest request,  Pageable pageable) {
        return productSearchRepository.getProductByType(
                request.isNew(),
                request.isSale(),
                request.isBestSeller(),
                request.getMinPrice(),
                request.getMaxPrice(),
                pageable
        ).map(productSearchMapper::toProductSearchResponse);
    }
}
