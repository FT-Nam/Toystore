package com.ftnam.toystore.controller;

import com.ftnam.toystore.dto.request.RoleRequest;
import com.ftnam.toystore.dto.response.ApiResponse;
import com.ftnam.toystore.dto.response.RoleResponse;
import com.ftnam.toystore.service.RoleService;
import com.ftnam.toystore.service.impl.RoleServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping("/role")
public class RoleController {
    private final RoleServiceImpl roleService;

    @PostMapping
    ApiResponse<RoleResponse> createRole(@RequestBody @Valid RoleRequest request){
        return ApiResponse.<RoleResponse>builder()
                .message("Create role has been successfully")
                .value(roleService.createRole(request))
                .build();
    }

    @GetMapping
    ApiResponse<Set<RoleResponse>> getRoles(){
        return ApiResponse.<Set<RoleResponse>>builder()
                .value(roleService.getRoles())
                .build();
    }

    @DeleteMapping("/{name}")
    ApiResponse<Void> deleteRole(@PathVariable String name){
        roleService.deleteRole(name);
        return ApiResponse.<Void>builder()
                .message("Delete role has been successfully")
                .build();
    }
}
