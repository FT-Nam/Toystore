package com.ftnam.toystore.search.mapper;

import com.ftnam.toystore.entity.Product;
import com.ftnam.toystore.search.document.ProductDocument;
import com.ftnam.toystore.search.dto.response.ProductSearchResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ProductSearchMapper {
    ProductDocument toProductDocument(Product product);

    ProductSearchResponse toProductSearchResponse(ProductDocument productDocument);
}
