package com.revshop.order.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
@Slf4j
public class NotificationClientFallback implements NotificationClient {
    @Override
    public void sendOrderNotification(Map<String, Object> payload) {
        log.warn("Notification service unavailable – order notification not sent: {}", payload);
    }
}
