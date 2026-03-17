package com.revshop.payment.dto;

import com.revshop.payment.entity.Payment;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentDto {

    @Data
    public static class InitiatePaymentRequest {
        private Long orderId;
        private String orderNumber;
        private BigDecimal amount;
        private Payment.PaymentMethod paymentMethod;
        // For card payments (simulated)
        private String cardNumber;
        private String cardExpiry;
        private String cardCvv;
    }

    @Data
    public static class PaymentResponse {
        private Long id;
        private String paymentId;
        private Long orderId;
        private String orderNumber;
        private Long buyerId;
        private BigDecimal amount;
        private Payment.PaymentMethod paymentMethod;
        private Payment.PaymentStatus status;
        private String transactionId;
        private String failureReason;
        private LocalDateTime createdAt;
    }

    @Data
    public static class RefundRequest {
        private String reason;
    }
}
