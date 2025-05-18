package com.ftnam.toystore.repository;

import com.ftnam.toystore.entity.Category;
import com.ftnam.toystore.entity.User;
import com.ftnam.toystore.enums.Provider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailAndProvider(String email, Provider provider);


}
