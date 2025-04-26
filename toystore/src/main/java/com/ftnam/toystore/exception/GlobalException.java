package com.ftnam.toystore.exception;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.ftnam.toystore.dto.response.ApiResponse;

@RestControllerAdvice
public class GlobalException {
//	@ExceptionHandler(value = RuntimeException.class)
//	public ResponseEntity<ApiResponse> handlingRuntimeException(RuntimeException exception){
//		ApiResponse apiResponse = ApiResponse.builder()
//				.code(ErrorCode.UNCATEGORIZED_ERROR.getCode())
//				.message(ErrorCode.UNCATEGORIZED_ERROR.getMessage())
//				.build();
//		return ResponseEntity.status(ErrorCode.UNCATEGORIZED_ERROR.getHttpStatus()).body(apiResponse);
//	}
	
	@ExceptionHandler(value = AppException.class)
	public ResponseEntity<ApiResponse> handlingAppException(AppException exception){
		ApiResponse apiResponse = ApiResponse.builder()
				.code(exception.getErrorCode().getCode())
				.message(exception.getErrorCode().getMessage())
				.build();
		return ResponseEntity.status(exception.getErrorCode().getHttpStatus()).body(apiResponse);
	}
	
	@ExceptionHandler(value = MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse> handlingMethodArgumentNotValidException(MethodArgumentNotValidException exception){
		List<String> errorMessage = exception.getBindingResult().getFieldErrors()
				.stream().map(error -> error.getDefaultMessage()).toList();
		ErrorCode errorCode = ErrorCode.INVALID_INPUT;
		Map<String, Object> attributesMap = null;
		errorCode = ErrorCode.valueOf(errorCode.toString());
		ApiResponse apiResponse = ApiResponse.builder()
				.code(ErrorCode.INVALID_INPUT.getCode())
				.message(String.join("; ", errorMessage))
				.build();
		return ResponseEntity.status(ErrorCode.INVALID_INPUT.getHttpStatus()).body(apiResponse);
	}
	
}
