package com.revshop.order.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "product-service", fallback = ProductClientFallback.class)
public interface ProductClient {

    @PutMapping("/api/products/{id}/stock/decrease")
    void decreaseStock(@PathVariable("id") Long productId, @RequestParam("quantity") int quantity);

    @PutMapping("/api/products/{id}/stock/increase")
    void increaseStock(@PathVariable("id") Long productId, @RequestParam("quantity") int quantity);
}
