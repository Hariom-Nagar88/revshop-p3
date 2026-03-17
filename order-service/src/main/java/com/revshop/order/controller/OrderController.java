package com.revshop.order.controller;

import com.revshop.order.dto.OrderDto;
import com.revshop.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    private Long getId(String s) {
        try { return Long.parseLong(s); } catch (Exception e) { return 0L; }
    }

    @PostMapping
    public ResponseEntity<OrderDto.OrderResponse> placeOrder(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String buyerId,
            @RequestHeader(value = "X-User-Name", defaultValue = "") String buyerEmail,
            @RequestHeader(value = "X-User-Full-Name", defaultValue = "") String buyerName,
            @RequestBody OrderDto.PlaceOrderRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.placeOrder(getId(buyerId), buyerEmail, buyerName, req));
    }

    @GetMapping
    public ResponseEntity<Page<OrderDto.OrderResponse>> getMyOrders(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String buyerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getBuyerOrders(getId(buyerId), page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto.OrderResponse> getOrder(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String buyerId,
            @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id, getId(buyerId)));
    }

    @GetMapping("/track/{orderNumber}")
    public ResponseEntity<OrderDto.OrderResponse> trackOrder(
            @PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.getOrderByNumber(orderNumber));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<OrderDto.OrderResponse> cancelOrder(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String buyerId,
            @PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(id, getId(buyerId)));
    }

    @GetMapping("/seller")
    public ResponseEntity<Page<OrderDto.OrderResponse>> getSellerOrders(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getSellerOrders(getId(sellerId), page, size));
    }

    @PutMapping("/seller/{orderId}/status")
    public ResponseEntity<OrderDto.OrderResponse> updateStatus(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String sellerId,
            @PathVariable Long orderId,
            @RequestBody OrderDto.UpdateOrderStatusRequest req) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, getId(sellerId), req));
    }

    @GetMapping("/seller/stats")
    public ResponseEntity<OrderDto.SellerOrderStats> getSellerStats(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String sellerId) {
        return ResponseEntity.ok(orderService.getSellerStats(getId(sellerId)));
    }
}
