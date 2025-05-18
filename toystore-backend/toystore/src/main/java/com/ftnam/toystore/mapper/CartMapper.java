package com.ftnam.toystore.mapper;

import com.ftnam.toystore.dto.request.CartRequest;
import com.ftnam.toystore.dto.response.CartResponse;
import com.ftnam.toystore.entity.Cart;
import com.ftnam.toystore.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface CartMapper {
    Cart toCart(CartRequest request);

    @Mapping(source = "user", target = "userId", qualifiedByName = "mapUserToId")
    CartResponse toCartResponse(Cart cart);

    @Named("mapUserToId")
    default Long mapUserToId(User user){
        return user.getId();
    }
}
