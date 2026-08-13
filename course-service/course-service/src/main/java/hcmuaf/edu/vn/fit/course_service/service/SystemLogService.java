package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.entity.SystemLog;
import hcmuaf.edu.vn.fit.course_service.repository.mongo.SystemLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl; // Bổ sung import
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate; // Bổ sung import
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query; // Import đúng Query của MongoTemplate
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List; // Bổ sung import

@Service
@RequiredArgsConstructor
public class SystemLogService {

    private final SystemLogRepository logRepository;


    private final MongoTemplate mongoTemplate;

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
        Query query = new Query();


        if (level != null && !level.trim().isEmpty() && !level.equals("ALL")) {
            query.addCriteria(Criteria.where("level").is(level));
        }


        if (keyword != null && !keyword.trim().isEmpty()) {
            Criteria keywordCriteria = new Criteria().orOperator(
                    Criteria.where("message").regex(keyword, "i"),
                    Criteria.where("action").regex(keyword, "i"),
                    Criteria.where("username").regex(keyword, "i"),
                    Criteria.where("ipAddress").regex(keyword, "i")
            );
            query.addCriteria(keywordCriteria);
        }


        long total = mongoTemplate.count(query, SystemLog.class);


        query.with(pageable);


        List<SystemLog> logs = mongoTemplate.find(query, SystemLog.class);

        return new PageImpl<>(logs, pageable, total);
    }
}