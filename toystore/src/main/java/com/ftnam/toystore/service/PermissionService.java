package com.ftnam.toystore.service;

import com.ftnam.toystore.dto.request.PermissionRequest;
import com.ftnam.toystore.dto.response.PermissionResponse;

import java.util.Set;

public interface PermissionService {
    PermissionResponse createPermission(PermissionRequest request);

    Set<PermissionResponse> getPermissions();

    void deletePermission(String id);
}
