package com.ftnam.toystore.service.impl;

import com.ftnam.toystore.dto.request.ProductCreationRequest;
import com.ftnam.toystore.dto.request.ProductUpdateRequest;
import com.ftnam.toystore.dto.response.ProductResponse;
import com.ftnam.toystore.entity.Category;
import com.ftnam.toystore.entity.Product;
import com.ftnam.toystore.exception.AppException;
import com.ftnam.toystore.exception.ErrorCode;
import com.ftnam.toystore.mapper.ProductMapper;
import com.ftnam.toystore.repository.CategoryRepository;
import com.ftnam.toystore.repository.ProductRepository;
import com.ftnam.toystore.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CategoryRepository categoryRepository;

    @PreAuthorize("hasAuthority('PRODUCT_CREATE')")
    @Override
    public ProductResponse createProduct(ProductCreationRequest request) {
        Product product = productMapper.toProduct(request);
        Set<Category> productsByCategoryId = request.getCategoryIds().stream()
                .map(categoryId -> categoryRepository.findById(categoryId)
                        .orElseThrow(() -> new AppException(ErrorCode.ID_NOT_EXISTED)))
                .collect(Collectors.toSet());
        product.setCategories(productsByCategoryId);
        return productMapper.toProductResponse(productRepository.save(product));
    }

    @Override
    public Page<ProductResponse> getAllProduct(Pageable pageable) {
        return productRepository.findAll(pageable).map(productMapper::toProductResponse);
    }

    @Override
    public Page<ProductResponse> getProductsByCategoryId(Long categoryId, Pageable pageable) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new AppException(ErrorCode.ID_NOT_EXISTED);
        }
        return productRepository.findByCategoriesCategoryId(categoryId,pageable).map(productMapper::toProductResponse);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id).orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED));
        return productMapper.toProductResponse(product);
    }

    @PreAuthorize("hasAuthority('PRODUCT_UPDATE')")
    @Override
    public ProductResponse updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id).orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED));
        Set<Category> category = request.getCategoryIds().stream()
                .map(c -> categoryRepository.findById(c)
                .orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED))).collect(Collectors.toSet());;
        product.setCategories(category);
        productMapper.updateProduct(product, request);
        return productMapper.toProductResponse(productRepository.save(product));
    }

    @PreAuthorize("hasAuthority('PRODUCT_DELETE')")
    @Override
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

}
