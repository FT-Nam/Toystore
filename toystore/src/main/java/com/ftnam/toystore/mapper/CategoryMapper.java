package com.ftnam.toystore.mapper;

import org.mapstruct.*;

import com.ftnam.toystore.dto.request.CategoryCreationRequest;
import com.ftnam.toystore.dto.request.CategoryUpdateRequest;
import com.ftnam.toystore.dto.response.CategoryResponse;
import com.ftnam.toystore.entity.Category;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
	Category toCategory(CategoryCreationRequest request);
	
	@Mapping(target = "categoryId", source = "category.categoryId")
	CategoryResponse toCategoryResponse(Category category);

	@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
	void updateCategory(@MappingTarget Category category, CategoryUpdateRequest request);
}
