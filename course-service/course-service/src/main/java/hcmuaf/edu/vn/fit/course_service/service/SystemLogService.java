package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.entity.SystemLog;
import hcmuaf.edu.vn.fit.course_service.repository.mongo.SystemLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SystemLogService {
    private final SystemLogRepository logRepository;


    public void writeLog(String level, String action, String message, String username, String ipAddress) {
        SystemLog log = SystemLog.builder()
                .level(level)
                .action(action)
                .message(message)
                .username(username)
                .ipAddress(ipAddress)
                .timestamp(LocalDateTime.now())
                .build();
        logRepository.save(log);
    }


    public Page<SystemLog> getLogs(String level, String keyword, Pageable pageable) {
        return logRepository.findByLevelContainingIgnoreCaseAndMessageContainingIgnoreCase(level, keyword, pageable);
    }
}