package com.ftnam.toystore.mapper;

import com.ftnam.toystore.dto.request.RoleRequest;
import com.ftnam.toystore.dto.response.RoleResponse;
import com.ftnam.toystore.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions", source = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
