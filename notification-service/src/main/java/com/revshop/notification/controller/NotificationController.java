package com.revshop.notification.controller;

import com.revshop.notification.entity.Notification;
import com.revshop.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    private Long getId(String s) {
        try { return Long.parseLong(s); } catch (Exception e) { return 0L; }
    }

    @PostMapping("/order")
    public ResponseEntity<Void> receiveOrderNotification(@RequestBody Map<String, Object> payload) {
        notificationService.processOrderNotification(payload);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(getId(userId)));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnread(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(getId(userId)));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadCount(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String userId) {
        return ResponseEntity.ok(notificationService.getUnreadCount(getId(userId)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(
            @RequestHeader(value = "X-User-Id", defaultValue = "0") String userId) {
        notificationService.markAllAsRead(getId(userId));
        return ResponseEntity.ok().build();
    }
}
