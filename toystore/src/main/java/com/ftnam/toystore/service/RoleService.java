package com.ftnam.toystore.service;

import com.ftnam.toystore.dto.request.RoleRequest;
import com.ftnam.toystore.dto.response.RoleResponse;
import com.ftnam.toystore.entity.Role;

import java.util.Set;

public interface RoleService {
    RoleResponse createRole(RoleRequest request);

    Set<RoleResponse> getRoles();

    void deleteRole(String id);
}
