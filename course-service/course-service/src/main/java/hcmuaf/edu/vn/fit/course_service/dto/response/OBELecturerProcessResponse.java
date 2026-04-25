package hcmuaf.edu.vn.fit.course_service.dto.response;


import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OBELecturerProcessResponse {

    private String offeringId;

    private int totalStudents;

    private double overallProgress;

    private List<CLOLecturerResponse> clos;

}
