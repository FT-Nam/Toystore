package com.ftnam.toystore.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryCreationRequest {
	private Long categoryId;
	
	@NotBlank(message = "CATEGORY_NAME_NOT_BLANK")
	private String categoryName;
}
