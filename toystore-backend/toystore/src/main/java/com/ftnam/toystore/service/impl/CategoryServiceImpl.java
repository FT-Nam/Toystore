package com.ftnam.toystore.service.impl;

import java.util.List;

import com.ftnam.toystore.service.CategoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.ftnam.toystore.dto.request.CategoryCreationRequest;
import com.ftnam.toystore.dto.request.CategoryUpdateRequest;
import com.ftnam.toystore.dto.response.CategoryResponse;
import com.ftnam.toystore.entity.Category;
import com.ftnam.toystore.exception.AppException;
import com.ftnam.toystore.exception.ErrorCode;
import com.ftnam.toystore.mapper.CategoryMapper;
import com.ftnam.toystore.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
	private final CategoryRepository categoryRepository;
	private final CategoryMapper categoryMapper;

	@PreAuthorize("hasAuthority('CATEGORY_CREATE')")
	@Override
	public CategoryResponse createCategory(CategoryCreationRequest request) {
		Category category = categoryMapper.toCategory(request);
		return categoryMapper.toCategoryResponse(categoryRepository.save(category));
	}

	@Override
	public Page<CategoryResponse> getAllCategory(Pageable pageable) {
		return categoryRepository.findAll(pageable).map(categoryMapper::toCategoryResponse);
	}

	@Override
	public CategoryResponse getCategoryById(Long categoryId) {
		Category category = categoryRepository.findById(categoryId)
				.orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED));
		return categoryMapper.toCategoryResponse(category);
	}

	@PreAuthorize("hasAuthority('CATEGORY_UPDATE')")
	@Override
	public CategoryResponse updateCategory(Long categoryId, CategoryUpdateRequest request) {
		Category category = categoryRepository.findById(categoryId)
				.orElseThrow(()-> new RuntimeException("Category id not found"));
		
		categoryMapper.updateCategory(category, request);
		return categoryMapper.toCategoryResponse(categoryRepository.save(category));
	}

	@PreAuthorize("hasAuthority('CATEGORY_DELETE')")
	@Override
	public void DeleteCategory(Long categoryId) {
		Category category = categoryRepository.findById(categoryId)
				.orElseThrow(()-> new RuntimeException("Category id not found"));
		categoryRepository.deleteById(categoryId);
	}
	
}
