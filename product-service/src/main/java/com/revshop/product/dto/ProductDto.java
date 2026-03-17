package com.revshop.product.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class ProductDto {

    @Data
    public static class CreateProductRequest {
        @NotBlank(message = "Product name is required")
        private String name;
        private String description;
        @NotNull @DecimalMin("0.01") private BigDecimal price;
        private BigDecimal originalPrice;
        @NotNull @Min(0) private Integer stock;
        private String imageUrl;
        private List<String> imageUrls;
        private String brand;
        @NotNull private Long categoryId;
        private Integer lowStockThreshold = 10;
    }

    @Data
    public static class UpdateProductRequest {
        private String name;
        private String description;
        @DecimalMin("0.01") private BigDecimal price;
        private BigDecimal originalPrice;
        @Min(0) private Integer stock;
        private String imageUrl;
        private List<String> imageUrls;
        private String brand;
        private Long categoryId;
        private Integer lowStockThreshold;
        private Boolean active;
    }

    @Data
    public static class ProductResponse {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private Integer stock;
        private String imageUrl;
        private List<String> imageUrls;
        private String brand;
        private Long categoryId;
        private String categoryName;
        private Long sellerId;
        private String sellerName;
        private Double averageRating;
        private Integer ratingCount;
        private boolean active;
        private Integer lowStockThreshold;
        private boolean lowStock;
        private LocalDateTime createdAt;
    }

    @Data
    public static class CategoryDto {
        private Long id;
        private String name;
        private String description;
        private String imageUrl;
        private String iconClass;
        private long productCount;
    }

    @Data
    public static class ReviewRequest {
        @NotBlank private String comment;
    }

    @Data
    public static class ReviewResponse {
        private Long id;
        private Long productId;
        private Long buyerId;
        private String buyerName;
        private String comment;
        private LocalDateTime createdAt;
    }

    @Data
    public static class RatingRequest {
        @NotNull @Min(1) @Max(5) private Integer score;
    }

    @Data
    public static class ProductSearchRequest {
        private String keyword;
        private Long categoryId;
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private String brand;
        private Double minRating;
        private String sortBy = "createdAt";
        private String sortDir = "desc";
        private int page = 0;
        private int size = 20;
    }

    @Data
    public static class SellerDashboardDto {
        private long totalProducts;
        private long totalOrders;
        private BigDecimal totalRevenue;
        private long lowStockProducts;
        private List<ProductResponse> recentProducts;
    }
}
