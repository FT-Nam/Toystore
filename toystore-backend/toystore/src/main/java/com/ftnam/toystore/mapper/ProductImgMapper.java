package com.ftnam.toystore.mapper;

import com.ftnam.toystore.dto.request.ProductImgCreationRequest;
import com.ftnam.toystore.dto.request.ProductImgUpdateRequest;
import com.ftnam.toystore.dto.response.ProductImgResponse;
import com.ftnam.toystore.entity.Product;
import com.ftnam.toystore.entity.ProductImg;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ProductImgMapper {
    ProductImg toProductImg(ProductImgCreationRequest request);

    @Mapping(source = "product.id", target = "productId")
    ProductImgResponse toProductImgResponse(ProductImg productImg);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateProductImg(@MappingTarget ProductImg productImg, ProductImgUpdateRequest request);
}
