package hcmuaf.edu.vn.fit.notification_service.service;


import hcmuaf.edu.vn.fit.notification_service.dto.SystemSettingDTO;
import hcmuaf.edu.vn.fit.notification_service.entity.SystemSetting;
import hcmuaf.edu.vn.fit.notification_service.repository.mysql.SystemSettingRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SystemSettingService {

    private final SystemSettingRepository repository;

    public SystemSettingService(SystemSettingRepository repository) {
        this.repository = repository;
    }

    // Lấy cấu hình hệ thống
    public SystemSetting getSettings() {
        return repository.findById(1L).orElseGet(this::createDefaultSettings);
    }

    // Cập nhật cấu hình
    @Transactional
    public SystemSetting updateSettings(SystemSettingDTO dto) {
        SystemSetting settings = getSettings();


        BeanUtils.copyProperties(dto, settings);

        return repository.save(settings);
    }


    private SystemSetting createDefaultSettings() {
        SystemSetting defaultSettings = SystemSetting.builder()
                .id(1L)
                .systemName("Hệ thống Quản lý OBE")
                .contactEmail("22130260@st.hcmuaf.edu.vn")
                .timezone("Asia/Ho_Chi_Minh")
                .twoFactorAuth(true)
                .requireStrongPwd(true)
                .emailNotifications(true)
                .smsAlerts(false)
                .theme("light")
                .build();
        return repository.save(defaultSettings);
    }
}