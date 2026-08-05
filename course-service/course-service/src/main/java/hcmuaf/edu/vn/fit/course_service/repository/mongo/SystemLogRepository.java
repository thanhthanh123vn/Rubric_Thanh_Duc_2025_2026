package hcmuaf.edu.vn.fit.course_service.repository.mongo;

import hcmuaf.edu.vn.fit.course_service.entity.SystemLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemLogRepository extends MongoRepository<SystemLog, String> {


    @Query("{ $and: [ " +
            "?#{ [0] == null || [0] == '' ? {} : { 'level': [0] } }, " +
            "?#{ [1] == null || [1] == '' ? {} : { $or: [ " +
            "{ 'message': { $regex: [1], $options: 'i' } }, " +
            "{ 'action': { $regex: [1], $options: 'i' } }, " +
            "{ 'username': { $regex: [1], $options: 'i' } }, " +
            "{ 'ipAddress': { $regex: [1], $options: 'i' } } " +
            "] } } " +
            "] }")
    Page<SystemLog> searchSystemLogs(String level, String keyword, Pageable pageable);
}