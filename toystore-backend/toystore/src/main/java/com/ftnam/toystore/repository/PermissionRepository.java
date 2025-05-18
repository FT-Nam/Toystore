package com.ftnam.toystore.repository;

import com.ftnam.toystore.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Set;

public interface PermissionRepository extends JpaRepository<Permission, String> {
}
