package com.ftnam.toystore.mapper;

import com.ftnam.toystore.dto.request.UserCreationRequest;
import com.ftnam.toystore.dto.request.UserUpdateRequest;
import com.ftnam.toystore.dto.response.UserResponse;
import com.ftnam.toystore.entity.Role;
import com.ftnam.toystore.entity.User;
import org.mapstruct.*;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);

    @Mapping(source = "roles", target = "roles", qualifiedByName = "mapRolesToId")
    UserResponse toUserResponse(User user);

    @Named("mapRolesToId")
    default Set<String> mapRolesToId(Set<Role> roles){
        return roles.stream().map(Role::getName).collect(Collectors.toSet());
    }

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
