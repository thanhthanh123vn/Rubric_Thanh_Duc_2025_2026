package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseOfferingResponse {
    private String offeringId;

    private CourseResponse course;


    private String lecturerId;
    private String lecturerName;

    private String semester;
    private String year;
    private Integer capacity;
}