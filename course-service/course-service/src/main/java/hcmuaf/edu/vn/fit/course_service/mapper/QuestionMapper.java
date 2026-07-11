package hcmuaf.edu.vn.fit.course_service.mapper;

import hcmuaf.edu.vn.fit.course_service.dto.response.QuestionBankResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.QuestionResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Question;
import hcmuaf.edu.vn.fit.course_service.entity.QuestionBank;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.function.Function;

@Mapper(componentModel = "spring", uses = DateMapper.class)
public interface QuestionMapper {
    @Mapping(source = "cloIds", target = "cloIds")
    QuestionResponse mapToResponse(Question question);


}
