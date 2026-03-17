package com.revshop.product.controller;

import com.revshop.product.dto.ProductDto;
import com.revshop.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Page<ProductDto.ProductResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(productService.getAllProducts(page, size, sortBy, sortDir));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto.ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductDto.ProductResponse>> search(
            @ModelAttribute ProductDto.ProductSearchRequest req) {
        return ResponseEntity.ok(productService.searchProducts(req));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<ProductDto.ReviewResponse>> getReviews(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductReviews(id));
    }

    @PostMapping
    public ResponseEntity<ProductDto.ProductResponse> create(
            @Valid @RequestBody ProductDto.CreateProductRequest req,
            @RequestHeader(value = "X-User-Name", defaultValue = "unknown") String sellerEmail,
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String sellerIdStr) {
        Long sellerId = parseLong(sellerIdStr);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createProduct(req, sellerId, sellerEmail));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDto.ProductResponse> update(
            @PathVariable Long id,
            @RequestBody ProductDto.UpdateProductRequest req,
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String sellerIdStr) {
        return ResponseEntity.ok(productService.updateProduct(id, req, parseLong(sellerIdStr)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String sellerIdStr) {
        productService.deleteProduct(id, parseLong(sellerIdStr));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/seller")
    public ResponseEntity<Page<ProductDto.ProductResponse>> getSellerProducts(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String sellerIdStr,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.getSellerProducts(parseLong(sellerIdStr), page, size));
    }

    @GetMapping("/seller/low-stock")
    public ResponseEntity<List<ProductDto.ProductResponse>> getLowStock(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String sellerIdStr) {
        return ResponseEntity.ok(productService.getLowStockProducts(parseLong(sellerIdStr)));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<ProductDto.ReviewResponse> addReview(
            @PathVariable Long id,
            @Valid @RequestBody ProductDto.ReviewRequest req,
            @RequestHeader(value = "X-User-Name", defaultValue = "unknown") String buyerEmail,
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String buyerIdStr) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.addReview(id, parseLong(buyerIdStr), buyerEmail, req));
    }

    @PostMapping("/{id}/rating")
    public ResponseEntity<Void> addRating(
            @PathVariable Long id,
            @Valid @RequestBody ProductDto.RatingRequest req,
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String buyerIdStr) {
        productService.addRating(id, parseLong(buyerIdStr), req);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/stock/decrease")
    public ResponseEntity<Void> decreaseStock(@PathVariable Long id, @RequestParam int quantity) {
        productService.decreaseStock(id, quantity);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/stock/increase")
    public ResponseEntity<Void> increaseStock(@PathVariable Long id, @RequestParam int quantity) {
        productService.increaseStock(id, quantity);
        return ResponseEntity.ok().build();
    }

    private Long parseLong(String val) {
        try { return Long.parseLong(val); }
        catch (Exception e) { return 0L; }
    }
}
