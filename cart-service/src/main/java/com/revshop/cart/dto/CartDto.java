package com.revshop.cart.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

public class CartDto {

    @Data
    public static class AddToCartRequest {
        private Long productId;
        private String productName;
        private String imageUrl;
        private BigDecimal price;
        private Integer quantity;
        private Long sellerId;
    }

    @Data
    public static class UpdateCartItemRequest {
        private Integer quantity;
    }

    @Data
    public static class CartItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String imageUrl;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal subtotal;
        private Long sellerId;
    }

    @Data
    public static class CartResponse {
        private Long id;
        private Long buyerId;
        private List<CartItemResponse> items;
        private BigDecimal totalPrice;
        private int totalItems;
    }

    @Data
    public static class WishlistRequest {
        private Long productId;
        private String productName;
        private String imageUrl;
        private BigDecimal productPrice;
    }

    @Data
    public static class WishlistResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String imageUrl;
        private BigDecimal productPrice;
        private java.time.LocalDateTime addedAt;
    }
}
