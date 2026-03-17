package com.revshop.order.dto;

import com.revshop.order.entity.Order;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDto {

    @Data
    public static class PlaceOrderRequest {
        private List<OrderItemRequest> items;
        private String shippingAddress;
        private String paymentMethod; // COD, CREDIT_CARD, DEBIT_CARD
        private String paymentId;
    }

    @Data
    public static class OrderItemRequest {
        private Long productId;
        private String productName;
        private String imageUrl;
        private BigDecimal price;
        private Integer quantity;
        private Long sellerId;
    }

    @Data
    public static class OrderItemResponse {
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
    public static class OrderResponse {
        private Long id;
        private String orderNumber;
        private Long buyerId;
        private String buyerEmail;
        private String buyerName;
        private Order.OrderStatus status;
        private BigDecimal totalAmount;
        private String shippingAddress;
        private String paymentMethod;
        private String trackingNumber;
        private List<OrderItemResponse> items;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class UpdateOrderStatusRequest {
        private Order.OrderStatus status;
        private String trackingNumber;
    }

    @Data
    public static class SellerOrderStats {
        private long totalOrders;
        private BigDecimal totalRevenue;
        private long pendingOrders;
        private long confirmedOrders;
        private long shippedOrders;
        private long deliveredOrders;
        private long cancelledOrders;
    }
}
