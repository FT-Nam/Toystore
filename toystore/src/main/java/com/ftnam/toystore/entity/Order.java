package com.ftnam.toystore.entity;

import com.ftnam.toystore.enums.StatusOrder;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id", nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusOrder status;

    @Column(name = "total_price", nullable = false, precision = 10, scale = 0)
    private BigDecimal totalPrice;

    @Column(name = "shipping_fee", nullable = false, precision = 10, scale = 0)
    private BigDecimal shippingFee;

    @Column(name = "address", nullable = false, length = 255)
    private String address;

    @Column(name = "payment_method")
    private String paymentMethod;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;
}
