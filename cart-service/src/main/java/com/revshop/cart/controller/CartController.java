package com.revshop.cart.controller;

import com.revshop.cart.dto.CartDto;
import com.revshop.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    private Long getId(String s) {
        try { return Long.parseLong(s); } catch (Exception e) { return 0L; }
    }

    @GetMapping
    public ResponseEntity<CartDto.CartResponse> getCart(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String userId) {
        return ResponseEntity.ok(cartService.getCart(getId(userId)));
    }

    // Add an item to the cart
    @PostMapping("/items")
    public ResponseEntity<CartDto.CartResponse> addItem(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String userId,
            @RequestBody CartDto.AddToCartRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cartService.addToCart(getId(userId), req));
    }

    
    // Update quantity or details of a specific cart item
    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDto.CartResponse> updateItem(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String userId,
            @PathVariable Long itemId,
            @RequestBody CartDto.UpdateCartItemRequest req) {
        return ResponseEntity.ok(cartService.updateItem(getId(userId), itemId, req));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDto.CartResponse> removeItem(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String userId,
            @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(getId(userId), itemId));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String userId) {
        cartService.clearCart(getId(userId));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/wishlist")
    public ResponseEntity<List<CartDto.WishlistResponse>> getWishlist(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String userId) {
        return ResponseEntity.ok(cartService.getWishlistItems(getId(userId)));
    }

    @PostMapping("/wishlist")
    public ResponseEntity<CartDto.WishlistResponse> addToWishlist(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String userId,
            @RequestBody CartDto.WishlistRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cartService.addToWishlist(getId(userId), req));
    }

    @DeleteMapping("/wishlist/{productId}")
    public ResponseEntity<Void> removeFromWishlist(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String userId,
            @PathVariable Long productId) {
        cartService.removeFromWishlist(getId(userId), productId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/wishlist/{productId}/check")
    public ResponseEntity<Boolean> isInWishlist(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String userId,
            @PathVariable Long productId) {
        return ResponseEntity.ok(cartService.isInWishlist(getId(userId), productId));
    }
}
