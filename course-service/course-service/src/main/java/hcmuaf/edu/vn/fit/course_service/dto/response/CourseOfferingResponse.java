package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseOfferingResponse {
    private String offeringId;
    private String offeringName;

    private CourseResponse course;




    private String semester;
    private String year;
    private Integer capacity;
    private Integer maxStudents;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;

    private List<LecturerInfo> lecturers;
}