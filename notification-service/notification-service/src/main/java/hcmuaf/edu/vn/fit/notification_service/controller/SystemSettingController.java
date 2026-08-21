package hcmuaf.edu.vn.fit.notification_service.controller;


import hcmuaf.edu.vn.fit.notification_service.dto.SystemSettingDTO;
import hcmuaf.edu.vn.fit.notification_service.entity.SystemSetting;
import hcmuaf.edu.vn.fit.notification_service.service.SystemSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notification-service/settings")
public class SystemSettingController {

    private final SystemSettingService settingService;

    public SystemSettingController(SystemSettingService settingService) {
        this.settingService = settingService;
    }

    @GetMapping
    public ResponseEntity<SystemSetting> getSettings() {
        return ResponseEntity.ok(settingService.getSettings());
    }

    @PutMapping
    public ResponseEntity<SystemSetting> updateSettings(@RequestBody SystemSettingDTO dto) {
        return ResponseEntity.ok(settingService.updateSettings(dto));
    }
}