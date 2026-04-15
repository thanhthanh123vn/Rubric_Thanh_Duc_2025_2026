package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

public interface CourseOfferingRepository extends JpaRepository<CourseOffering, String> {
    // Bạn có thể thêm các phương thức tìm kiếm tùy chỉnh tại đây nếu cần

}