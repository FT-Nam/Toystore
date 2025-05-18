package com.ftnam.toystore.exception;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ErrorCode {
	//UNCATEGORIZED_ERROR(999, "Uncategorized error", HttpStatus.BAD_REQUEST),
	ID_NOT_EXISTED(1000, "Id not existed", HttpStatus.NOT_FOUND),
	INVALID_INPUT(1001, "invalid input", HttpStatus.BAD_REQUEST),
	CATEGORY_NAME_NOT_BLANK(1002,"Category name must not be blank", HttpStatus.BAD_REQUEST),
	MAX_IMAGES_EXCEEDED(1003, "Maximum number of images exceeded", HttpStatus.BAD_REQUEST),
	IMAGE_TOO_LARGE(1004, "Image size exceeds the allowed limit", HttpStatus.BAD_REQUEST),
	INVALID_IMAGE_FORMAT(1005, "Invalid image format. Allowed formats: JPG, JPEG, PNG, WEBP", HttpStatus.BAD_REQUEST),
	IMAGE_UPLOAD_FAILED(1006, "Failed to upload image", HttpStatus.INTERNAL_SERVER_ERROR),
	CART_ITEM_EMPTY(1007,"Cart item is empty", HttpStatus.BAD_REQUEST),
	CART_ALREADY_EXISTS(1008, "Cart already exists for this user", HttpStatus.BAD_REQUEST),
	USER_NOT_EXISTED(1009, "User not existed", HttpStatus.NOT_FOUND),
	UNAUTHENTICATED(1010, "Unauthenticated", HttpStatus.UNAUTHORIZED),
	USER_EXISTED(1011, "User existed" ,HttpStatus.NOT_FOUND);
	
	private final int code;
	private final String message;
	private final HttpStatus httpStatus;
}
