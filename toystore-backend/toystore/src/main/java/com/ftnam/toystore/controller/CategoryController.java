package com.ftnam.toystore.controller;

import java.util.List;

import com.ftnam.toystore.dto.response.PaginationInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ftnam.toystore.dto.request.CategoryCreationRequest;
import com.ftnam.toystore.dto.request.CategoryUpdateRequest;
import com.ftnam.toystore.dto.response.ApiResponse;
import com.ftnam.toystore.dto.response.CategoryResponse;
import com.ftnam.toystore.service.impl.CategoryServiceImpl;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
public class CategoryController {
	private final CategoryServiceImpl categoryService;
	
	@PostMapping
	ApiResponse<CategoryResponse> createCategory(@RequestBody @Valid CategoryCreationRequest request){
		return ApiResponse.<CategoryResponse>builder()
				.message("Create category successfully")
				.value(categoryService.createCategory(request))
				.build();
	}
	
	@GetMapping
	ApiResponse<List<CategoryResponse>> getAllCategory(Pageable pageable){
		Page<CategoryResponse> categoryResponsePage = categoryService.getAllCategory(pageable);
		return ApiResponse.<List<CategoryResponse>>builder()
				.value(categoryResponsePage.getContent())
				.pagination(PaginationInfo.builder()
						.page(categoryResponsePage.getNumber() + 1)
						.size(categoryResponsePage.getSize())
						.totalElements(categoryResponsePage.getTotalElements())
						.build())
				.build();
	}
	
	@GetMapping("/{categoryId}")
	ApiResponse<CategoryResponse> getCategoryById(@PathVariable("categoryId") Long categoryId){
		return ApiResponse.<CategoryResponse>builder()
				.value(categoryService.getCategoryById(categoryId))
				.build();
	}
	
	@PutMapping("/{categoryId}")
	ApiResponse<CategoryResponse> updateCategory(@PathVariable("categoryId") Long categoryId,@RequestBody @Valid CategoryUpdateRequest request){
		return ApiResponse.<CategoryResponse>builder()
				.message("Update category successfully")
				.value(categoryService.updateCategory(categoryId, request))
				.build();
	}
	
	@DeleteMapping("/{categoryId}")
	ApiResponse<Void> deleteCategory(@PathVariable("categoryId") Long categoryId){
		categoryService.DeleteCategory(categoryId);
		return ApiResponse.<Void>builder()
				.message("Delete category successfully")
				.build();
	}
}
