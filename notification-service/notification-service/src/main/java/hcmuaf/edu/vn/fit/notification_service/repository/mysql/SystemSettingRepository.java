package hcmuaf.edu.vn.fit.notification_service.repository.mysql;

import hcmuaf.edu.vn.fit.notification_service.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {
}