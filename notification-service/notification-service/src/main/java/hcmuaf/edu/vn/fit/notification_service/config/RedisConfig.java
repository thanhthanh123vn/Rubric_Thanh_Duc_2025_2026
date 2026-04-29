package hcmuaf.edu.vn.fit.notification_service.config;

import hcmuaf.edu.vn.fit.notification_service.service.RedisNotificationSubscriber;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.PatternTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

@Configuration
public class RedisConfig {

    // Cấu hình lắng nghe kênh "notification-channel"
    @Bean
    public RedisMessageListenerContainer container(RedisConnectionFactory connectionFactory,
                                                   MessageListenerAdapter listenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(listenerAdapter, new PatternTopic("notification-channel"));
        return container;
    }

    // Đăng ký Subscriber
    @Bean
    public MessageListenerAdapter listenerAdapter(RedisNotificationSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "onMessage");
    }
}