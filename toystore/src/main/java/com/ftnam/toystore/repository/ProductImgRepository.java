package com.ftnam.toystore.repository;

import com.ftnam.toystore.entity.Product;
import com.ftnam.toystore.entity.ProductImg;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImgRepository extends JpaRepository<ProductImg, Long> {
}
