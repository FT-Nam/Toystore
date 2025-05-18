package com.ftnam.toystore.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    @Column(name = "name", nullable = false, length = 500)
    private String name;

    @Column(name = "image_url", nullable = false, columnDefinition = "LONGTEXT")
    private String thumbnail;

    @Column(name = "brand", nullable = false, length = 50)
    private String brand;

    @Column(name = "description", nullable = false, columnDefinition = "LONGTEXT")
    private String description;

    @Column(name = "price", nullable = false, precision = 10, scale = 0)
    private BigDecimal price;

    @Column(name = "discount_percentage")
    private Integer discountPercentage;

    @Column(name = "stock", nullable = false)
    private int stock;

    @ManyToMany
    private Set<Category> categories;

    @Column(name = "is_new", nullable = false)
    private boolean isNew;

    @Column(name = "is_best_seller", nullable = false)
    private boolean isBestSeller;

    @Column(name = "is_sale", nullable = false)
    private boolean isSale;

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<CartItem> cartItems;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImg> productImg;
}
