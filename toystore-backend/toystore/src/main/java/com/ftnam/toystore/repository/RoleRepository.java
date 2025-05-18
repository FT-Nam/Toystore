package com.ftnam.toystore.repository;

import com.ftnam.toystore.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, String> {
}
