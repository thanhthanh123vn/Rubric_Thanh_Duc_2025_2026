package hcmuaf.edu.vn.fit.grading_service.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class CourseOfferingInfoResponse {
    private Double attendanceWeight;
    private Double assignmentWeight;
    private List<StudentInfoDto> students;

    // Thêm danh sách các bài đánh giá để lấy ID và Type
    private List<AssessmentDto> assessments;
}