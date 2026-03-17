package com.revshop.notification.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_email")
    private String userEmail;

    @Column(nullable = false)
    private String type; // ORDER_CONFIRMED, ORDER_SHIPPED, ORDER_DELIVERED, LOW_STOCK

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "reference_id")
    private String referenceId;

    private boolean read = false;
    private boolean sent = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}
