package com.ftnam.toystore.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ftnam.toystore.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

}
