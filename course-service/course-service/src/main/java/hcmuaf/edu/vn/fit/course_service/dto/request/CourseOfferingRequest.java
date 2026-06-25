package hcmuaf.edu.vn.fit.course_service.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class CourseOfferingRequest {
    private String courseId;
    private String lecturerId;
    private String semester;
    private String academicYear;
    private Integer maxStudents;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    private List<String> lecturerIds;
    private String offeringName;
}