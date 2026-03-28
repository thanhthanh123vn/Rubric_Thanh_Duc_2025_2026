package hcmuaf.edu.vn.fit.rubric_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.concurrent.TimeUnit;

@Service
public class AttendanceRedisService {
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    public void saveTemporaryAttendance(String studentId, String locationData) {
        String key = "attendance_session:" + studentId;
        // Lưu dữ liệu điểm danh vào Redis, tự động xóa sau 15 phút
        redisTemplate.opsForValue().set(key, locationData,
                15, TimeUnit.MINUTES);
    }
}