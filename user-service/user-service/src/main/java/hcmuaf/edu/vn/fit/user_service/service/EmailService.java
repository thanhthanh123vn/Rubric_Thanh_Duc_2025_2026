package hcmuaf.edu.vn.fit.user_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    @Value("${GOOGLE_APP_USERNAME:}")
    private String email;
    private final JavaMailSender javaMailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(email);
        message.setTo(toEmail);
        message.setSubject("Yêu cầu khôi phục mật khẩu - Hệ thống OBE");
        message.setText("Mã OTP để khôi phục mật khẩu của bạn là: " + otp + "\n\nMã này sẽ hết hạn trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.");

        javaMailSender.send(message);
    }
}