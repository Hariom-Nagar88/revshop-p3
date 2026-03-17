package com.revshop.order.service;

import com.revshop.order.client.NotificationClient;
import com.revshop.order.client.ProductClient;
import com.revshop.order.dto.OrderDto;
import com.revshop.order.entity.Order;
import com.revshop.order.entity.OrderItem;
import com.revshop.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepo;
    private final ProductClient productClient;
    private final NotificationClient notificationClient;

    @Transactional
    public OrderDto.OrderResponse placeOrder(Long buyerId, String buyerEmail,
                                              String buyerName, OrderDto.PlaceOrderRequest req) {
        // Build items
        List<OrderItem> items = req.getItems().stream().map(i -> OrderItem.builder()
                .productId(i.getProductId()).productName(i.getProductName())
                .imageUrl(i.getImageUrl()).price(i.getPrice())
                .quantity(i.getQuantity()).sellerId(i.getSellerId()).build()
        ).collect(Collectors.toList());

        BigDecimal total = items.stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .buyerId(buyerId).buyerEmail(buyerEmail).buyerName(buyerName)
                .status(Order.OrderStatus.CONFIRMED)
                .totalAmount(total)
                .shippingAddress(req.getShippingAddress())
                .paymentMethod(req.getPaymentMethod())
                .paymentId(req.getPaymentId())
                .items(items).build();

        items.forEach(i -> i.setOrder(order));
        Order saved = orderRepo.save(order);

        // Decrease stock via Feign
        items.forEach(i -> {
            try {
                productClient.decreaseStock(i.getProductId(), i.getQuantity());
            } catch (Exception e) {
                log.warn("Could not decrease stock for product {}: {}", i.getProductId(), e.getMessage());
            }
        });

        // Send notification
        try {
            Map<String, Object> notifPayload = Map.of(
                    "type", "ORDER_CONFIRMED",
                    "orderId", saved.getId(),
                    "orderNumber", saved.getOrderNumber(),
                    "buyerEmail", buyerEmail,
                    "buyerName", buyerName,
                    "totalAmount", total.toString()
            );
            notificationClient.sendOrderNotification(notifPayload);
        } catch (Exception e) {
            log.warn("Notification send failed: {}", e.getMessage());
        }

        return mapToResponse(saved);
    }

    public Page<OrderDto.OrderResponse> getBuyerOrders(Long buyerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return orderRepo.findByBuyerIdOrderByCreatedAtDesc(buyerId, pageable).map(this::mapToResponse);
    }

    public OrderDto.OrderResponse getOrderById(Long id, Long buyerId) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found: " + id));
        if (!order.getBuyerId().equals(buyerId)) throw new RuntimeException("Access denied");
        return mapToResponse(order);
    }

    public OrderDto.OrderResponse getOrderByNumber(String orderNumber) {
        return mapToResponse(orderRepo.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderNumber)));
    }

    @Transactional
    public OrderDto.OrderResponse cancelOrder(Long id, Long buyerId) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getBuyerId().equals(buyerId)) throw new RuntimeException("Access denied");
        if (order.getStatus() == Order.OrderStatus.SHIPPED || order.getStatus() == Order.OrderStatus.DELIVERED)
            throw new RuntimeException("Cannot cancel a shipped or delivered order");

        order.setStatus(Order.OrderStatus.CANCELLED);
        // Restore stock
        order.getItems().forEach(i -> {
            try { productClient.increaseStock(i.getProductId(), i.getQuantity()); }
            catch (Exception e) { log.warn("Stock restore failed: {}", e.getMessage()); }
        });
        return mapToResponse(orderRepo.save(order));
    }

    // Seller APIs
    public Page<OrderDto.OrderResponse> getSellerOrders(Long sellerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return orderRepo.findOrdersBySeller(sellerId, pageable).map(this::mapToResponse);
    }

    @Transactional
    public OrderDto.OrderResponse updateOrderStatus(Long orderId, Long sellerId,
                                                     OrderDto.UpdateOrderStatusRequest req) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        boolean hasSellersItems = order.getItems().stream()
                .anyMatch(i -> i.getSellerId().equals(sellerId));
        if (!hasSellersItems) throw new RuntimeException("Access denied");

        order.setStatus(req.getStatus());
        if (req.getTrackingNumber() != null) order.setTrackingNumber(req.getTrackingNumber());

        if (req.getStatus() == Order.OrderStatus.SHIPPED) {
            try {
                Map<String, Object> notifPayload = Map.of(
                        "type", "ORDER_SHIPPED",
                        "orderId", order.getId(),
                        "orderNumber", order.getOrderNumber(),
                        "buyerEmail", order.getBuyerEmail(),
                        "trackingNumber", req.getTrackingNumber() != null ? req.getTrackingNumber() : ""
                );
                notificationClient.sendOrderNotification(notifPayload);
            } catch (Exception e) {
                log.warn("Notification failed: {}", e.getMessage());
            }
        }
        return mapToResponse(orderRepo.save(order));
    }

    public OrderDto.SellerOrderStats getSellerStats(Long sellerId) {
        OrderDto.SellerOrderStats stats = new OrderDto.SellerOrderStats();
        stats.setTotalOrders(orderRepo.countOrdersBySeller(sellerId));
        stats.setTotalRevenue(Optional.ofNullable(orderRepo.calculateSellerRevenue(sellerId)).orElse(BigDecimal.ZERO));
        stats.setPendingOrders(orderRepo.countBySellerAndStatus(sellerId, Order.OrderStatus.PENDING));
        stats.setConfirmedOrders(orderRepo.countBySellerAndStatus(sellerId, Order.OrderStatus.CONFIRMED));
        stats.setShippedOrders(orderRepo.countBySellerAndStatus(sellerId, Order.OrderStatus.SHIPPED));
        stats.setDeliveredOrders(orderRepo.countBySellerAndStatus(sellerId, Order.OrderStatus.DELIVERED));
        stats.setCancelledOrders(orderRepo.countBySellerAndStatus(sellerId, Order.OrderStatus.CANCELLED));
        return stats;
    }

    private String generateOrderNumber() {
        return "REV-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 9000 + 1000);
    }

    private OrderDto.OrderResponse mapToResponse(Order o) {
        OrderDto.OrderResponse r = new OrderDto.OrderResponse();
        r.setId(o.getId()); r.setOrderNumber(o.getOrderNumber());
        r.setBuyerId(o.getBuyerId()); r.setBuyerEmail(o.getBuyerEmail());
        r.setBuyerName(o.getBuyerName()); r.setStatus(o.getStatus());
        r.setTotalAmount(o.getTotalAmount()); r.setShippingAddress(o.getShippingAddress());
        r.setPaymentMethod(o.getPaymentMethod()); r.setTrackingNumber(o.getTrackingNumber());
        r.setCreatedAt(o.getCreatedAt()); r.setUpdatedAt(o.getUpdatedAt());
        r.setItems(o.getItems().stream().map(i -> {
            OrderDto.OrderItemResponse ir = new OrderDto.OrderItemResponse();
            ir.setId(i.getId()); ir.setProductId(i.getProductId());
            ir.setProductName(i.getProductName()); ir.setImageUrl(i.getImageUrl());
            ir.setPrice(i.getPrice()); ir.setQuantity(i.getQuantity());
            ir.setSubtotal(i.getSubtotal()); ir.setSellerId(i.getSellerId());
            return ir;
        }).collect(Collectors.toList()));
        return r;
    }
}
