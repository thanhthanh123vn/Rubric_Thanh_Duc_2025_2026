package hcmuaf.edu.vn.fit.course_service.dto.response;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TeacherCourseResponse {
    private String offeringId;
    private String courseCode;
    private String courseName;
    private String courseTitle;
    private long studentCount;
    private String semester;
    private int obeProgress;
    private String lecturerName;
}