package com.ftnam.toystore.mapper;

import com.ftnam.toystore.dto.request.CartItemCreationRequest;
import com.ftnam.toystore.dto.response.CartItemResponse;
import com.ftnam.toystore.entity.Cart;
import com.ftnam.toystore.entity.CartItem;
import com.ftnam.toystore.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface CartItemMapper {
    CartItem toCartItem(CartItemCreationRequest request);

    @Mapping(source = "cart.id", target = "cartId")
    @Mapping(source = "product.id", target = "productId")
    CartItemResponse toCartItemResponse(CartItem cartItem);

}
