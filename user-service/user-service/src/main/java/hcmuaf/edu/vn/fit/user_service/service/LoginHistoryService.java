package hcmuaf.edu.vn.fit.user_service.service;

import hcmuaf.edu.vn.fit.user_service.client.NotificationsClient;
import hcmuaf.edu.vn.fit.user_service.entity.LoginHistory;
import hcmuaf.edu.vn.fit.user_service.repository.LoginHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;
@Service
@RequiredArgsConstructor
@Slf4j
public class LoginHistoryService {

    private final LoginHistoryRepository loginHistoryRepository;
    private final NotificationsClient notificationsClient;

    public void recordLogin(
            String userId,
            String email,
            String phone,
            String ipAddress,
            String userAgent
    ) {

        // Lấy lần đăng nhập thành công gần nhất
        Optional<LoginHistory> lastLogin =
                loginHistoryRepository
                        .findTopByUserIdAndStatusOrderByLoginAtDesc(
                                userId,
                                "SUCCESS"
                        );

        boolean suspicious = false;

        if (lastLogin.isPresent()) {

            LoginHistory previous = lastLogin.get();

            boolean differentIp =
                    !Objects.equals(previous.getIpAddress(), ipAddress);

            boolean differentDevice =
                    !Objects.equals(previous.getUserAgent(), userAgent);

            // IP hoặc thiết bị thay đổi
            if (differentIp || differentDevice) {
                suspicious = true;
            }
        }

        // Lưu lịch sử đăng nhập
        LoginHistory history = LoginHistory.builder()
                .userId(userId)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .loginAt(LocalDateTime.now())
                .status("SUCCESS")
                .suspicious(suspicious)
                .build();

        loginHistoryRepository.save(history);

        // Nếu phát hiện bất thường → cảnh báo
        if (suspicious) {

            log.warn(
                    "Phát hiện đăng nhập bất thường: userId={}, ip={}",
                    userId,
                    ipAddress
            );

            notificationsClient.sendEmail(
                    email,
                    "Cảnh báo bảo mật",
                    "Tài khoản của bạn vừa được đăng nhập từ một thiết bị hoặc địa chỉ IP mới."
            );

//            if (phone != null && !phone.isBlank()) {
//                notificationsClient.sendSmsAlert(
//                        phone,
//                        "CẢNH BÁO: Tài khoản của bạn vừa đăng nhập từ thiết bị hoặc địa chỉ IP mới."
//                );
//            }
        }
    }
}