package hcmuaf.edu.vn.fit.course_service.dto;


import hcmuaf.edu.vn.fit.course_service.entity.enums.AnswerType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StudentAnswerDto {
    @NotBlank
    private String questionId;

    @NotNull
    private AnswerType type;

    private Integer selectedOptionIndex;
    private String textAnswer;
}