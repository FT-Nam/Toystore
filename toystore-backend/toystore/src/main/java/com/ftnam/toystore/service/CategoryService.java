package com.ftnam.toystore.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.ftnam.toystore.dto.request.CategoryCreationRequest;
import com.ftnam.toystore.dto.request.CategoryUpdateRequest;
import com.ftnam.toystore.dto.response.CategoryResponse;

@Service
public interface CategoryService {
	CategoryResponse createCategory(CategoryCreationRequest request);
	
	Page<CategoryResponse> getAllCategory(Pageable pageable);
	
	CategoryResponse getCategoryById(Long categoryId);
	
	CategoryResponse updateCategory(Long categoryId, CategoryUpdateRequest request);
	
	void DeleteCategory(Long categoryId);

}
