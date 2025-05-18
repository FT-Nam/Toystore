package com.ftnam.toystore.entity;

import jakarta.persistence.*;
import lombok.*;
import org.apache.el.parser.AstFalse;

import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "categories")
public class Category {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "category_id")
	private Long categoryId;
	
	@Column(name = "name",nullable = false)
	private String categoryName;

	@ManyToMany(mappedBy = "categories")
	private Set<Product> products;
}
