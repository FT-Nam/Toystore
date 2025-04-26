package com.ftnam.toystore.repository;

import com.ftnam.toystore.entity.Cart;
import com.ftnam.toystore.entity.CartItem;
import com.ftnam.toystore.entity.Product;
import com.ftnam.toystore.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    CartItem findByCartAndProduct(Cart cart, Product product);

}
