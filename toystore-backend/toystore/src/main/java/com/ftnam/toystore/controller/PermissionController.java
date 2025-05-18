package com.ftnam.toystore.controller;

import com.ftnam.toystore.dto.request.PermissionRequest;
import com.ftnam.toystore.dto.response.ApiResponse;
import com.ftnam.toystore.dto.response.PermissionResponse;
import com.ftnam.toystore.service.impl.PermissionServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequiredArgsConstructor
@RequestMapping("/permission")
public class PermissionController {
    private final PermissionServiceImpl permissionService;

    @PostMapping
    ApiResponse<PermissionResponse> createPermission(@RequestBody @Valid PermissionRequest request){
        return ApiResponse.<PermissionResponse>builder()
                .message("Create permission has been successfully")
                .value(permissionService.createPermission(request))
                .build();
    }

    @GetMapping
    ApiResponse<Set<PermissionResponse>> getPermissions(){
        return ApiResponse.<Set<PermissionResponse>>builder()
                .value(permissionService.getPermissions())
                .build();
    }

    @DeleteMapping("/{name}")
    ApiResponse<Void> deletePermission(@PathVariable String name){
        permissionService.deletePermission(name);
        return ApiResponse.<Void>builder()
                .message("Delete permission has been successfully")
                .build();
    }
}
