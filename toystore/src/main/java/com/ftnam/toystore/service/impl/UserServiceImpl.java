package com.ftnam.toystore.service.impl;

import com.ftnam.toystore.dto.request.UserCreationRequest;
import com.ftnam.toystore.dto.request.UserUpdateRequest;
import com.ftnam.toystore.dto.response.UserResponse;
import com.ftnam.toystore.entity.Role;
import com.ftnam.toystore.entity.User;
import com.ftnam.toystore.enums.Provider;
import com.ftnam.toystore.exception.AppException;
import com.ftnam.toystore.exception.ErrorCode;
import com.ftnam.toystore.mapper.UserMapper;
import com.ftnam.toystore.repository.RoleRepository;
import com.ftnam.toystore.repository.UserRepository;
import com.ftnam.toystore.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    @PreAuthorize("hasAuthority('USER_CREATE')")
    @Override
    public UserResponse createUserForAdmin(UserCreationRequest request) {
        return createUser(request, true);
    }

    @Override
    public UserResponse register(UserCreationRequest request) {
        return createUser(request, false);
    }

    @Override
    @PreAuthorize("hasAuthority('USER_VIEW')")
    public Page<UserResponse> getAllUser(Pageable pageable) {
        return userRepository.findAll(pageable).map(userMapper::toUserResponse);
    }

    // #id là tham số truyền vào (Long id)
    @PostAuthorize("hasRole('ADMIN') or #id.toString() == authentication.name")
    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED));
        return userMapper.toUserResponse(user);
    }

    @Override
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toUserResponse(user);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toUserResponse(user);
    }

    @Override
    public UserResponse getUserByEmailAndProvider(String email, Provider provider) {
        User user = userRepository.findByEmailAndProvider(email,provider)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasAuthority('USER_UPDATE')")
    @Override
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.ID_NOT_EXISTED));

        userMapper.updateUser(user, request);
        return userMapper.toUserResponse(userRepository.save(user));
    }


    @PreAuthorize("hasAuthority('USER_DELETE')")
    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    private UserResponse createUser (UserCreationRequest request, boolean isAdmin){
        User user = userMapper.toUser(request);
        user.setProvider(Provider.LOCAL);
        String password = passwordEncoder.encode(request.getPassword());
        user.setPassword(password);

        Optional<User> userExisted = userRepository.findByUsername(request.getUsername());
        if (userExisted.isPresent()) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        Set<Role> roles = new HashSet<>();
        if (isAdmin && request.getRole() != null && !request.getRole().isEmpty()) {
            Set<Role> role = request.getRole().stream().map(roleName -> roleRepository.findById(roleName)
                    .orElseThrow(() -> new AppException(ErrorCode.ID_NOT_EXISTED))).collect(Collectors.toSet());
            roles.addAll(role);
            user.setRoles(roles);
        } else {
            Role customerRole = roleRepository.findById("CUSTOMER")
                    .orElseThrow(() -> new AppException(ErrorCode.ID_NOT_EXISTED));

            user.setRoles(Set.of(customerRole));
        }
        return userMapper.toUserResponse(userRepository.save(user));
    }

}
