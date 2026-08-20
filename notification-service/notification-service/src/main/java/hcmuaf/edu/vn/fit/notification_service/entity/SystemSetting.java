package hcmuaf.edu.vn.fit.notification_service.entity;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "system_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSetting {

    @Id
    private Long id = 1L;

    private String systemName;
    private String contactEmail;
    private String timezone;

    // Bảo mật
    private boolean twoFactorAuth;
    private boolean requireStrongPwd;

    // Thông báo
    private boolean emailNotifications;
    private boolean smsAlerts;

    // Giao diện
    private String theme;
    private String logoUrl;
}