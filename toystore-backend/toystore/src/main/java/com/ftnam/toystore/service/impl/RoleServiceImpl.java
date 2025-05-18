package com.ftnam.toystore.service.impl;

import com.ftnam.toystore.dto.request.RoleRequest;
import com.ftnam.toystore.dto.response.RoleResponse;
import com.ftnam.toystore.entity.Permission;
import com.ftnam.toystore.entity.Role;
import com.ftnam.toystore.mapper.RoleMapper;
import com.ftnam.toystore.repository.PermissionRepository;
import com.ftnam.toystore.repository.RoleRepository;
import com.ftnam.toystore.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;
    private final PermissionRepository permissionRepository;

    @Override
    public RoleResponse createRole(RoleRequest request) {
        Role role = roleMapper.toRole(request);
        var permissions = permissionRepository.findAllById(request.getPermissions());
        role.setPermissions(new HashSet<>(permissions));
        return roleMapper.toRoleResponse(roleRepository.save(role));
    }

    @Override
    public Set<RoleResponse> getRoles() {
        return roleRepository.findAll().stream().map(roleMapper::toRoleResponse).collect(Collectors.toSet());
    }

    @Override
    public void deleteRole(String id) {
        roleRepository.deleteById(id);
    }
}
