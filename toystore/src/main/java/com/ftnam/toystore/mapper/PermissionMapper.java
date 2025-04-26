package com.ftnam.toystore.mapper;

import com.ftnam.toystore.dto.request.PermissionRequest;
import com.ftnam.toystore.dto.response.PermissionResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    com.ftnam.toystore.entity.Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(com.ftnam.toystore.entity.Permission permission);

}
