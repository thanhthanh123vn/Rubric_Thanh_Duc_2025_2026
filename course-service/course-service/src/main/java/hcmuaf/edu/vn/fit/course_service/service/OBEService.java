package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.response.CLOLecturerResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.OBELecturerProcessResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.OBEProgressResponse;
import hcmuaf.edu.vn.fit.course_service.repository.CourseRepository;
import hcmuaf.edu.vn.fit.course_service.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OBEService {

    private final CourseRepository courseRepo;

    private final EnrollmentRepository  enrollmentRepo;


    public List<OBEProgressResponse> getOBEProgressByStudentId(String offeringId, String studentId) {
        List<Object[]> rows = courseRepo.getOBEByOfferingByStudent(offeringId,studentId);

        return rows.stream().map(r -> new OBEProgressResponse(
                (String) r[0],
                (String) r[1],
                (String) r[2],
                r[3] != null ? ((Number) r[3]).doubleValue() : 0,
                r[4] != null ? ((Number) r[4]).doubleValue() : 0,
                r[5] != null ? ((Number) r[5]).doubleValue() : 0
        )).toList();
    }

    public OBELecturerProcessResponse getOBEForLecturer(String offeringId) {

        List<Object[]> cloRows = courseRepo.getOBEByOffering(offeringId);

        int totalStudents = enrollmentRepo.countByCourseOffering_OfferingId(offeringId);

        List<CLOLecturerResponse> clos = cloRows.stream().map(r -> {

            double percent = r[3] != null ? ((Number) r[3]).doubleValue() : 0;

            int passed = (int) Math.round(percent / 100 * totalStudents);
            int failed = totalStudents - passed;

            return CLOLecturerResponse.builder()
                    .cloId((String) r[0])
                    .cloCode((String) r[1])
                    .cloDescription((String) r[2])
                    .progressPercent(percent)
                    .totalStudents(totalStudents)
                    .passedStudents(passed)
                    .failedStudents(failed)

                    // fake distribution (sau này thay SQL)
                    .below40((int) (totalStudents * 0.2))
                    .from40to70((int) (totalStudents * 0.5))
                    .above70((int) (totalStudents * 0.3))

                    .build();
        }).toList();

        double overall = clos.stream()
                .mapToDouble(CLOLecturerResponse::getProgressPercent)
                .average()
                .orElse(0);

        return OBELecturerProcessResponse.builder()
                .offeringId(offeringId)
                .totalStudents(totalStudents)
                .overallProgress(overall)
                .clos(clos)
                .build();
    }
}
