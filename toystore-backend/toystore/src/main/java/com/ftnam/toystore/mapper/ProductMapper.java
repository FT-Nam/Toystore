package com.ftnam.toystore.mapper;

import com.ftnam.toystore.dto.request.ProductCreationRequest;
import com.ftnam.toystore.dto.request.ProductUpdateRequest;
import com.ftnam.toystore.dto.response.ProductResponse;
import com.ftnam.toystore.entity.Category;
import com.ftnam.toystore.entity.Product;
import org.mapstruct.*;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    @Mapping(source = "new", target = "isNew")
    @Mapping(source = "sale", target = "isSale")
    @Mapping(source = "bestSeller", target = "isBestSeller")
    Product toProduct(ProductCreationRequest request);

    @Mapping(target = "categoryIds", source = "categories", qualifiedByName = "mapCategoriesToIds")
    @Mapping(target = "id", source = "product.id")
    @Mapping(source = "new", target = "isNew")
    @Mapping(source = "sale", target = "isSale")
    @Mapping(source = "bestSeller", target = "isBestSeller")
    ProductResponse toProductResponse(Product product);

    @Named("mapCategoriesToIds")
    default Set<Long> mapCategoriesToIds(Set<Category> categories) {
        return categories.stream().map(Category::getCategoryId).collect(Collectors.toSet());
    }

    @Mapping(source = "new", target = "new")
    @Mapping(source = "sale", target = "sale")
    @Mapping(source = "bestSeller", target = "bestSeller")
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateProduct(@MappingTarget Product product, ProductUpdateRequest request);
}
