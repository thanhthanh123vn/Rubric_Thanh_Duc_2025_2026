package hcmuaf.edu.vn.fit.course_service.dto.request;

import hcmuaf.edu.vn.fit.course_service.dto.StudentAnswerDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class SubmitStudentExamRequest {
    @NotBlank
    private String examId;

    @NotNull
    @Valid
    private List<StudentAnswerDto> answers;

    @NotNull
    private Instant submittedAt;

    @NotNull
    private Boolean autoSubmit;
}