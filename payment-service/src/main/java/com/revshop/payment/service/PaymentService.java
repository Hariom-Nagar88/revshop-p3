package com.revshop.payment.service;

import com.revshop.payment.dto.PaymentDto;
import com.revshop.payment.entity.Payment;
import com.revshop.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepo;

    @Transactional
    public PaymentDto.PaymentResponse initiatePayment(Long buyerId, PaymentDto.InitiatePaymentRequest req) {
        String paymentId = "PAY-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        Payment payment = Payment.builder()
                .paymentId(paymentId)
                .orderId(req.getOrderId())
                .orderNumber(req.getOrderNumber())
                .buyerId(buyerId)
                .amount(req.getAmount())
                .paymentMethod(req.getPaymentMethod())
                .status(Payment.PaymentStatus.PENDING)
                .build();

        payment = paymentRepo.save(payment);

        // Simulate payment processing
        Payment.PaymentStatus resultStatus;
        String transactionId = null;
        String failureReason = null;

        if (req.getPaymentMethod() == Payment.PaymentMethod.CASH_ON_DELIVERY) {
            resultStatus = Payment.PaymentStatus.SUCCESS;
            transactionId = "COD-" + System.currentTimeMillis();
        } else {
            // Simulate card validation (90% success rate)
            boolean success = Math.random() > 0.1;
            if (success) {
                resultStatus = Payment.PaymentStatus.SUCCESS;
                transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
            } else {
                resultStatus = Payment.PaymentStatus.FAILED;
                failureReason = "Insufficient funds or card declined";
            }
        }

        payment.setStatus(resultStatus);
        payment.setTransactionId(transactionId);
        payment.setFailureReason(failureReason);
        payment = paymentRepo.save(payment);

        log.info("Payment {} processed: status={}", paymentId, resultStatus);
        return mapToResponse(payment);
    }

    public PaymentDto.PaymentResponse getPaymentByOrderId(Long orderId) {
        return paymentRepo.findByOrderId(orderId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Payment not found for order: " + orderId));
    }

    public List<PaymentDto.PaymentResponse> getBuyerPayments(Long buyerId) {
        return paymentRepo.findByBuyerIdOrderByCreatedAtDesc(buyerId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public PaymentDto.PaymentResponse refundPayment(String paymentId, PaymentDto.RefundRequest req) {
        Payment payment = paymentRepo.findByPaymentId(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));
        if (payment.getStatus() != Payment.PaymentStatus.SUCCESS)
            throw new RuntimeException("Only successful payments can be refunded");
        payment.setStatus(Payment.PaymentStatus.REFUNDED);
        return mapToResponse(paymentRepo.save(payment));
    }

    private PaymentDto.PaymentResponse mapToResponse(Payment p) {
        PaymentDto.PaymentResponse r = new PaymentDto.PaymentResponse();
        r.setId(p.getId()); r.setPaymentId(p.getPaymentId());
        r.setOrderId(p.getOrderId()); r.setOrderNumber(p.getOrderNumber());
        r.setBuyerId(p.getBuyerId()); r.setAmount(p.getAmount());
        r.setPaymentMethod(p.getPaymentMethod()); r.setStatus(p.getStatus());
        r.setTransactionId(p.getTransactionId()); r.setFailureReason(p.getFailureReason());
        r.setCreatedAt(p.getCreatedAt());
        return r;
    }
}
