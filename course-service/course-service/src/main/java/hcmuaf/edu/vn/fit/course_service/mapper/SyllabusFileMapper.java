package hcmuaf.edu.vn.fit.course_service.mapper;

import hcmuaf.edu.vn.fit.course_service.dto.response.SyllabusFileDTO;
import hcmuaf.edu.vn.fit.course_service.entity.SyllabusFile;
import org.mapstruct.Mapper;

import java.util.List;


@Mapper(componentModel = "spring")
public interface SyllabusFileMapper {


    SyllabusFileDTO toResponse(SyllabusFile syllabusFile);


    List<SyllabusFileDTO> toResponseList(List<SyllabusFile> syllabusFiles);
}