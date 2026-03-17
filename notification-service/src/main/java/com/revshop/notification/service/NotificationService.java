package com.revshop.notification.service;

import com.revshop.notification.entity.Notification;
import com.revshop.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final JavaMailSender mailSender;

    @Transactional
    public void processOrderNotification(Map<String, Object> payload) {
        String type = (String) payload.get("type");
        String buyerEmail = (String) payload.get("buyerEmail");
        String buyerName  = (String) payload.get("buyerName");
        String orderNumber = (String) payload.get("orderNumber");
        Object orderIdObj  = payload.get("orderId");
        Long orderId = orderIdObj instanceof Number ? ((Number) orderIdObj).longValue() : null;

        String message = buildMessage(type, buyerName, orderNumber, payload);

        Notification notification = Notification.builder()
                .userEmail(buyerEmail)
                .type(type)
                .message(message)
                .referenceId(orderNumber)
                .build();

        boolean emailSent = false;
        try {
            sendEmail(buyerEmail, subjectFor(type), message);
            emailSent = true;
        } catch (Exception e) {
            log.warn("Email send failed to {}: {}", buyerEmail, e.getMessage());
        }
        notification.setSent(emailSent);
        notificationRepo.save(notification);
        log.info("Notification saved – type={}, to={}", type, buyerEmail);
    }

    @Transactional
    public void sendLowStockAlert(Long sellerId, String sellerEmail, String productName, int stock) {
        String message = String.format("Low stock alert: Product '%s' has only %d units remaining.", productName, stock);
        Notification notification = Notification.builder()
                .userId(sellerId).userEmail(sellerEmail)
                .type("LOW_STOCK").message(message)
                .referenceId(productName).build();
        try {
            sendEmail(sellerEmail, "Low Stock Alert – " + productName, message);
            notification.setSent(true);
        } catch (Exception e) {
            log.warn("Low-stock email failed: {}", e.getMessage());
        }
        notificationRepo.save(notification);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepo.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepo.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepo.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepo.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepo.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId).forEach(n -> {
            n.setRead(true);
            notificationRepo.save(n);
        });
    }

    private void sendEmail(String to, String subject, String text) {
        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom("noreply@revshop.com");
        mail.setTo(to);
        mail.setSubject(subject);
        mail.setText(text);
        mailSender.send(mail);
    }

    private String subjectFor(String type) {
        return switch (type) {
            case "ORDER_CONFIRMED" -> "Your RevShop order has been confirmed!";
            case "ORDER_SHIPPED"   -> "Your RevShop order is on its way!";
            case "ORDER_DELIVERED" -> "Your RevShop order has been delivered!";
            case "ORDER_CANCELLED" -> "Your RevShop order has been cancelled.";
            default -> "RevShop Notification";
        };
    }

    private String buildMessage(String type, String name, String orderNumber, Map<String, Object> payload) {
        return switch (type) {
            case "ORDER_CONFIRMED" -> String.format(
                "Hi %s,\n\nYour order #%s has been confirmed!\nTotal: ₹%s\n\nThank you for shopping with RevShop!",
                name, orderNumber, payload.getOrDefault("totalAmount", ""));
            case "ORDER_SHIPPED" -> String.format(
                "Hi %s,\n\nGreat news! Your order #%s has been shipped.\nTracking number: %s\n\nRevShop Team",
                name, orderNumber, payload.getOrDefault("trackingNumber", "N/A"));
            case "ORDER_DELIVERED" -> String.format(
                "Hi %s,\n\nYour order #%s has been delivered. Enjoy your purchase!\n\nRevShop Team",
                name, orderNumber);
            case "ORDER_CANCELLED" -> String.format(
                "Hi %s,\n\nYour order #%s has been cancelled.\n\nRevShop Team", name, orderNumber);
            default -> "You have a new notification from RevShop.";
        };
    }
}
