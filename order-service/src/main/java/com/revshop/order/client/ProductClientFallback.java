package com.revshop.order.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ProductClientFallback implements ProductClient {

    @Override
    public void decreaseStock(Long productId, int quantity) {
        log.error("Product service unavailable – could not decrease stock for product {}", productId);
        throw new RuntimeException("Product service unavailable");
    }

    @Override
    public void increaseStock(Long productId, int quantity) {
        log.error("Product service unavailable – could not increase stock for product {}", productId);
    }
}
