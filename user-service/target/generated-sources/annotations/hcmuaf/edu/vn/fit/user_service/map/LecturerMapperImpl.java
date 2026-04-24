package hcmuaf.edu.vn.fit.user_service.map;

import hcmuaf.edu.vn.fit.user_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.user_service.entity.Department;
import hcmuaf.edu.vn.fit.user_service.entity.Lecturer;
import hcmuaf.edu.vn.fit.user_service.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-24T15:08:47+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 23.0.1 (Oracle Corporation)"
)
@Component
public class LecturerMapperImpl implements LecturerMapper {

    @Override
    public LecturerResponse toResponse(Lecturer lecturer) {
        if ( lecturer == null ) {
            return null;
        }

        String userId = null;
        String title = null;
        String email = null;
        String department = null;
        String lecturerId = null;
        String fullName = null;

        userId = lecturerUserUserId( lecturer );
        title = lecturer.getAcademicTitle();
        email = lecturerUserEmail( lecturer );
        department = lecturerDepartmentDepartmentName( lecturer );
        lecturerId = lecturer.getLecturerId();
        fullName = lecturer.getFullName();

        LecturerResponse lecturerResponse = new LecturerResponse( lecturerId, userId, fullName, email, department, title );

        return lecturerResponse;
    }

    @Override
    public Lecturer toEntity(LecturerResponse response) {
        if ( response == null ) {
            return null;
        }

        Lecturer.LecturerBuilder lecturer = Lecturer.builder();

        lecturer.department( lecturerResponseToDepartment( response ) );
        lecturer.lecturerId( response.lecturerId() );
        lecturer.fullName( response.fullName() );

        return lecturer.build();
    }

    private String lecturerUserUserId(Lecturer lecturer) {
        User user = lecturer.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getUserId();
    }

    private String lecturerUserEmail(Lecturer lecturer) {
        User user = lecturer.getUser();
        if ( user == null ) {
            return null;
        }
        return user.getEmail();
    }

    private String lecturerDepartmentDepartmentName(Lecturer lecturer) {
        Department department = lecturer.getDepartment();
        if ( department == null ) {
            return null;
        }
        return department.getDepartmentName();
    }

    protected Department lecturerResponseToDepartment(LecturerResponse lecturerResponse) {
        if ( lecturerResponse == null ) {
            return null;
        }

        Department department = new Department();

        department.setDepartmentName( lecturerResponse.department() );

        return department;
    }
}
