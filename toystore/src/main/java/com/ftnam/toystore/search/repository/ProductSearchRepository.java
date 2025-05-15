package com.ftnam.toystore.search.repository;

import com.ftnam.toystore.search.document.ProductDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.util.List;

public interface ProductSearchRepository extends ElasticsearchRepository<ProductDocument,Long> {
    List<ProductDocument> findByNameContaining(String name);
}
