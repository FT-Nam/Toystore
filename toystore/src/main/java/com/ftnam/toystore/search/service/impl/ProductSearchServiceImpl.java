package com.ftnam.toystore.search.service.impl;

import com.ftnam.toystore.entity.Product;
import com.ftnam.toystore.search.document.ProductDocument;
import com.ftnam.toystore.search.dto.response.ProductSearchResponse;
import com.ftnam.toystore.search.mapper.ProductSearchMapper;
import com.ftnam.toystore.search.repository.ProductSearchRepository;
import com.ftnam.toystore.search.service.ProductSearchService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductSearchServiceImpl implements ProductSearchService {
    ProductSearchRepository productSearchRepository;
    ProductSearchMapper productSearchMapper;

    ElasticsearchRestTemplate elasticsearchTemplate;

    @Override
    public void saveProduct(Product product) {
        ProductDocument productDocument = productSearchMapper.toProductDocument(product);
        productSearchRepository.save(productDocument);
    }

    @Override
    public List<ProductSearchResponse> searchByName(String name) {
        return productSearchRepository.findByNameContaining(name)
                .stream().map(productSearchMapper::toProductSearchResponse).toList();
    }
}
