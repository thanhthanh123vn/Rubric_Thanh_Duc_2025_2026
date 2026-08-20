package hcmuaf.edu.vn.fit.notification_service.dto;
import lombok.Data;

@Data
public class SystemSettingDTO {
    private String systemName;
    private String contactEmail;
    private String timezone;
    private boolean twoFactorAuth;
    private boolean requireStrongPwd;
    private boolean emailNotifications;
    private boolean smsAlerts;
    private String theme;
    private String logoUrl;
}