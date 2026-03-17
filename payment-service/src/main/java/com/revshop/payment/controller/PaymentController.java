package com.revshop.payment.controller;

import com.revshop.payment.dto.PaymentDto;
import com.revshop.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    private Long getId(String s) {
        try { return Long.parseLong(s); } catch (Exception e) { return 0L; }
    }

    @PostMapping
    public ResponseEntity<PaymentDto.PaymentResponse> initiatePayment(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String buyerId,
            @RequestBody PaymentDto.InitiatePaymentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.initiatePayment(getId(buyerId), req));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentDto.PaymentResponse> getByOrder(
            @PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<PaymentDto.PaymentResponse>> getMyPayments(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String buyerId) {
        return ResponseEntity.ok(paymentService.getBuyerPayments(getId(buyerId)));
    }

    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<PaymentDto.PaymentResponse> refund(
            @PathVariable String paymentId,
            @RequestBody PaymentDto.RefundRequest req) {
        return ResponseEntity.ok(paymentService.refundPayment(paymentId, req));
    }
}
