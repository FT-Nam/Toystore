package com.ftnam.toystore.mapper;

import com.ftnam.toystore.dto.request.OrderCreationRequest;
import com.ftnam.toystore.dto.request.OrderUpdateRequest;
import com.ftnam.toystore.dto.response.OrderResponse;
import com.ftnam.toystore.entity.Order;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    Order toOrder(OrderCreationRequest request);

    @Mapping(source = "user.id", target = "userId")
    OrderResponse toOrderResponse(Order order);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateOrder(@MappingTarget Order order, OrderUpdateRequest request);
}
