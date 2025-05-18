package com.ftnam.toystore.configuration;

import com.ftnam.toystore.entity.Product;
import com.ftnam.toystore.repository.ProductRepository;
import com.ftnam.toystore.search.document.ProductDocument;
import com.ftnam.toystore.search.mapper.ProductSearchMapper;
import com.ftnam.toystore.search.repository.ProductSearchRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApplicationInitConfig {
    ProductRepository productRepository;
    ProductSearchRepository productSearchRepository;
    ProductSearchMapper productSearchMapper;

    @Bean
    ApplicationRunner syncProductToElastic(){
        return args -> {
            long count = productSearchRepository.count();
            if(count == 0){
                log.info("Elasticsearch empty. Syncing product data...");

                List<Product> products = productRepository.findAll();
                List<ProductDocument> productDocuments = products.stream()
                        .map(productSearchMapper::toProductDocument).toList();

                productSearchRepository.saveAll(productDocuments);
                log.info("✅ Synchronized {} products to Elasticsearch", productDocuments.size());
            } else {
                log.info("Elasticsearch already has data ({} records), skipping sync.", count);
            }
        };
    }
}
