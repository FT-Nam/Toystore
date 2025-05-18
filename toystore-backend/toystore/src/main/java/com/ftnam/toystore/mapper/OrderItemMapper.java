package com.ftnam.toystore.mapper;

import com.ftnam.toystore.dto.response.OrderItemResponse;
import com.ftnam.toystore.entity.Order;
import com.ftnam.toystore.entity.OrderItem;
import com.ftnam.toystore.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {
    @Mapping(source = "order.id", target = "orderId")
    @Mapping(source = "product.id", target = "productId")
    OrderItemResponse toOrderItemResponse(OrderItem orderItem);

}
