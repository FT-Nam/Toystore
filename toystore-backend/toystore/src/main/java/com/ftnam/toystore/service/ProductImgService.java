package com.ftnam.toystore.service;

import com.ftnam.toystore.dto.request.ProductImgCreationRequest;
import com.ftnam.toystore.dto.request.ProductImgUpdateRequest;
import com.ftnam.toystore.dto.response.ProductImgResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductImgService {
    ProductImgResponse createProductImg(ProductImgCreationRequest request);

    Page<ProductImgResponse> getAllProductImg(Pageable pageable);

    List<ProductImgResponse> getImagesByProductId(Long id);

    ProductImgResponse updateProductImg(Long id, ProductImgUpdateRequest request);

    void deleteProductImg(Long id);
}
