package com.ftnam.toystore.service;

import com.ftnam.toystore.dto.request.UserCreationRequest;
import com.ftnam.toystore.dto.request.UserUpdateRequest;
import com.ftnam.toystore.dto.response.UserResponse;
import com.ftnam.toystore.enums.Provider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse createUserForAdmin(UserCreationRequest request);

    UserResponse register(UserCreationRequest request);

    Page<UserResponse> getAllUser(Pageable pageable);

    UserResponse getUserById(Long id);

    UserResponse getUserByUsername(String username);

    UserResponse getUserByEmail(String email);

    UserResponse getUserByEmailAndProvider(String email, Provider provider);

    UserResponse updateUser(Long id, UserUpdateRequest request);

    void deleteUser(Long id);
}
