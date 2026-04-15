package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardCourseResponse {
    private String offeringId;
    private String courseCode;
    private String courseName;
    private int credits;
    private String semester;
    private String academicYear;
    private String lecturerName;
}