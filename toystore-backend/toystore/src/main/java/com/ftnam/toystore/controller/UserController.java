package com.ftnam.toystore.controller;

import com.ftnam.toystore.dto.request.UserCreationRequest;
import com.ftnam.toystore.dto.request.UserUpdateRequest;
import com.ftnam.toystore.dto.response.ApiResponse;
import com.ftnam.toystore.dto.response.PaginationInfo;
import com.ftnam.toystore.dto.response.UserResponse;
import com.ftnam.toystore.enums.Provider;
import com.ftnam.toystore.service.impl.UserServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    private final UserServiceImpl userService;

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@RequestBody @Valid UserCreationRequest request){
        return ApiResponse.<UserResponse>builder()
                .message("Create user has been successfully")
                .value(userService.register(request))
                .build();
    }

    @PostMapping
    public ApiResponse<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request){
        return ApiResponse.<UserResponse>builder()
                .message("Create user has been successfully")
                .value(userService.createUserForAdmin(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<UserResponse>> getAllUser(Pageable pageable){
        Page<UserResponse> userResponsePage = userService.getAllUser(pageable);
        return ApiResponse.<List<UserResponse>>builder()
                .value(userResponsePage.getContent())
                .pagination(PaginationInfo.builder()
                        .page(userResponsePage.getNumber())
                        .size(userResponsePage.getSize())
                        .totalElements(userResponsePage.getTotalElements())
                        .build())
                .build();
    }

    @GetMapping("/id/{id}")
    public ApiResponse<UserResponse> getUserById(@PathVariable Long id){
        return ApiResponse.<UserResponse>builder()
                .value(userService.getUserById(id))
                .build();
    }

    @GetMapping("/username/{username}")
    public ApiResponse<UserResponse> getUserByUsername(@PathVariable String username){
        return ApiResponse.<UserResponse>builder()
                .value(userService.getUserByUsername(username))
                .build();
    }

    @GetMapping("/email/{email}")
    public ApiResponse<UserResponse> getUserByEmail(@PathVariable String email){
        return ApiResponse.<UserResponse>builder()
                .value(userService.getUserByEmail(email))
                .build();
    }

    @GetMapping("/email-provider")
    public ApiResponse<UserResponse> getUserByEmailAndProvider(@RequestParam String email, @RequestParam Provider provider){
        return ApiResponse.<UserResponse>builder()
                .value(userService.getUserByEmailAndProvider(email,provider))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<UserResponse> updateUser(@PathVariable Long id, @RequestBody @Valid UserUpdateRequest request){
        return ApiResponse.<UserResponse>builder()
                .value(userService.updateUser(id, request))
                .message("Update user has been successfully")
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id){
        userService.deleteUser(id);
        return ApiResponse.<Void>builder()
                .message("Delete user has been successfully")
                .build();
    }
}
