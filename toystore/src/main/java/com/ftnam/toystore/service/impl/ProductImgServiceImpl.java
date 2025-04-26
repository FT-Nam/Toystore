package com.ftnam.toystore.service.impl;

import com.ftnam.toystore.dto.request.ProductImgCreationRequest;
import com.ftnam.toystore.dto.request.ProductImgUpdateRequest;
import com.ftnam.toystore.dto.response.ProductImgResponse;
import com.ftnam.toystore.entity.Product;
import com.ftnam.toystore.entity.ProductImg;
import com.ftnam.toystore.exception.AppException;
import com.ftnam.toystore.exception.ErrorCode;
import com.ftnam.toystore.mapper.ProductImgMapper;
import com.ftnam.toystore.repository.ProductImgRepository;
import com.ftnam.toystore.repository.ProductRepository;
import com.ftnam.toystore.service.ProductImgService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductImgServiceImpl implements ProductImgService {
    private final ProductImgRepository productImgRepository;
    private final ProductRepository productRepository;
    private final ProductImgMapper productImgMapper;

    @PreAuthorize("hasAuthority('PRODUCT_CREATE')")
    @Override
    public ProductImgResponse createProductImg(ProductImgCreationRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new AppException(ErrorCode.ID_NOT_EXISTED));
        ProductImg productImg = productImgMapper.toProductImg(request);
        productImg.setProduct(product);
        return productImgMapper.toProductImgResponse(productImgRepository.save(productImg));
    }

    @Override
    public Page<ProductImgResponse> getAllProductImg(Pageable pageable) {
        return productImgRepository.findAll(pageable).map(productImgMapper::toProductImgResponse);
    }

    @Override
    public List<ProductImgResponse> getImagesByProductId(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED));

        List<ProductImg> productImg = product.getProductImg()
                .stream().map(image -> productImgRepository.findById(image.getId())
                        .orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED))).toList();

        return productImg.stream().map(productImgMapper::toProductImgResponse).toList();
    }

    @PreAuthorize("hasAuthority('PRODUCT_UPDATE')")
    @Override
    public ProductImgResponse updateProductImg(Long id, ProductImgUpdateRequest request) {
        ProductImg productImg = productImgRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED));

        productImgMapper.updateProductImg(productImg, request);

        return productImgMapper.toProductImgResponse(productImgRepository.save(productImg));
    }

    @PreAuthorize("hasAuthority('PRODUCT_DELETE')")
    @Override
    public void deleteProductImg(Long id) {
        productImgRepository.deleteById(id);
    }
}
