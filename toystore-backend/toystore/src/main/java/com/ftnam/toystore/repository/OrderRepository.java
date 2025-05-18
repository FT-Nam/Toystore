package com.ftnam.toystore.repository;

import com.ftnam.toystore.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order,Long> {
}
