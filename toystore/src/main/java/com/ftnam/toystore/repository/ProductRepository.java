package com.ftnam.toystore.repository;

import com.ftnam.toystore.entity.Category;
import com.ftnam.toystore.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByCategoriesCategoryId(Long id, Pageable pageable);

}
