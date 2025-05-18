package com.ftnam.toystore.search.repository;

import com.ftnam.toystore.search.document.ProductDocument;
import com.ftnam.toystore.search.dto.request.ProductFilterRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.annotations.Query;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.math.BigDecimal;
import java.util.List;

public interface ProductSearchRepository extends ElasticsearchRepository<ProductDocument,Long> {
    @Query("""
       {
             "match": {
               "name": "?0"
             }
           }
    """)
    Page<ProductDocument> searchByName(String name, Pageable pageable);


    @Query("""
    {
      "bool": {
        "must": [
          { "match": { "name": "?0" } },
          { "term": { "isNew": ?1 } },
          { "term": { "isSale": ?2 } },
          { "term": { "isBestSeller": ?3 } },
          { "range": { "price": { "gte": ?4, "lte": ?5 } } }
        ]
      }
    }
    """)
    Page<ProductDocument> productFilter(String name, boolean newProduct, boolean sale, boolean bestSeller,
                                        BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    @Query("""
    {
      "bool": {
        "must": [
          { "term": { "isNew": ?0 } },
          { "term": { "isSale": ?1 } },
          { "term": { "isBestSeller": ?2 } },
          { "range": { "price": { "gte": ?3, "lte": ?4 } } }
        ]
      }
    }
    """)
    Page<ProductDocument> getProductByType(boolean newProduct, boolean sale, boolean bestSeller,
                                           BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

}
