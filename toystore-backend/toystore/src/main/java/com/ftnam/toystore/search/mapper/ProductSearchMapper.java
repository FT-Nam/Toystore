package com.ftnam.toystore.search.mapper;

import com.ftnam.toystore.entity.Product;
import com.ftnam.toystore.search.document.ProductDocument;
import com.ftnam.toystore.search.dto.response.ProductSearchResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductSearchMapper {
    @Mapping(source = "new", target = "isNew")
    @Mapping(source = "sale", target = "isSale")
    @Mapping(source = "bestSeller", target = "isBestSeller")
    ProductDocument toProductDocument(Product product);

    @Mapping(source = "new", target = "isNew")
    @Mapping(source = "sale", target = "isSale")
    @Mapping(source = "bestSeller", target = "isBestSeller")
    ProductSearchResponse toProductSearchResponse(ProductDocument productDocument);
}
