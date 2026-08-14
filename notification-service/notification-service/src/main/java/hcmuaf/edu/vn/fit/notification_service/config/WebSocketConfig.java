package hcmuaf.edu.vn.fit.notification_service.config;

import hcmuaf.edu.vn.fit.notification_service.util.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
//    @Value("${URL_FRONTEND}")
//    private String origins;
    @Autowired
    private JwtUtils jwtUtils;
    @Autowired
    private UserDetailsService userDetailsService;
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.setApplicationDestinationPrefixes("/app");

        config.enableSimpleBroker("/topic", "/queue", "/user");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-notifications")
                .setAllowedOriginPatterns("*")
                .withSockJS();

    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                System.out.println("STOMP Command = " + accessor.getCommand());
                System.out.println("Headers = " + accessor.toNativeHeaderMap());
                // Chỉ kiểm tra token khi client gửi yêu cầu CONNECT
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // Lấy header Authorization từ connectHeaders của Frontend gửi lên
                    List<String> authorization = accessor.getNativeHeader("Authorization");

                    if (authorization != null && !authorization.isEmpty()) {
                        String bearerToken = authorization.get(0);
                        if (bearerToken.startsWith("Bearer ")) {
                            String token = bearerToken.substring(7);

                            // Validate token (Thay đổi tên hàm validateToken tùy theo JwtUtils của bạn)
                            if (jwtUtils.isTokenValid(token)) {
                                // Lấy username từ token

                                String username = jwtUtils.extractUsername(token);
                                String role = jwtUtils.extractRole(token);

                                UsernamePasswordAuthenticationToken authentication =
                                        new UsernamePasswordAuthenticationToken(
                                                username,
                                                null,
                                                List.of(new SimpleGrantedAuthority("ROLE_" + role))
                                        );

                                accessor.setUser(authentication);


                            } else {
                                throw new IllegalArgumentException("Invalid JWT Token in WebSocket Handshake");
                            }
                        }
                    } else {
                        throw new IllegalArgumentException("Missing Authorization header in WebSocket Handshake");
                    }
                }
                return message;
            }
        });
    }

}