package com.ftnam.toystore.service.impl;

import com.ftnam.toystore.dto.request.PermissionRequest;
import com.ftnam.toystore.dto.response.PermissionResponse;
import com.ftnam.toystore.entity.Permission;
import com.ftnam.toystore.mapper.PermissionMapper;
import com.ftnam.toystore.repository.PermissionRepository;
import com.ftnam.toystore.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {
    private final PermissionRepository permissionRepository;
    private final PermissionMapper permissionMapper;

    @Override
    public PermissionResponse createPermission(PermissionRequest request) {
        Permission permission = permissionMapper.toPermission(request);
        return permissionMapper.toPermissionResponse(permissionRepository.save(permission));
    }

    @Override
    public Set<PermissionResponse> getPermissions() {
        return permissionRepository.findAll().stream().map(permissionMapper::toPermissionResponse).collect(Collectors.toSet());
    }

    @Override
    public void deletePermission(String id) {
        permissionRepository.deleteById(id);
    }
}
