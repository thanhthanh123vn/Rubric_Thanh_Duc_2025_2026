package hcmuaf.edu.vn.fit.course_service.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CourseRequest {
    @NotBlank(message = "Mã môn học không được để trống")
    private String courseCode;
    @NotBlank(message = "Tên môn học không được để trống")
    private String courseName;
    @Min(value = 1, message = "Số tín chỉ phải lớn hơn 0")
    private Integer credits;
    private String description;
    private String department;
}