package hcmuaf.edu.vn.fit.user_service.map;

import hcmuaf.edu.vn.fit.user_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.user_service.entity.Lecturer;
import hcmuaf.edu.vn.fit.user_service.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-23T23:00:53+0700",
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
        String lecturerId = null;
        String fullName = null;
        String department = null;

        userId = lecturerUserUserId( lecturer );
        title = lecturer.getAcademicTitle();
        email = lecturerUserEmail( lecturer );
        lecturerId = lecturer.getLecturerId();
        fullName = lecturer.getFullName();
        department = lecturer.getDepartment();

        LecturerResponse lecturerResponse = new LecturerResponse( lecturerId, userId, fullName, email, department, title );

        return lecturerResponse;
    }

    @Override
    public Lecturer toEntity(LecturerResponse response) {
        if ( response == null ) {
            return null;
        }

        Lecturer.LecturerBuilder lecturer = Lecturer.builder();

        lecturer.lecturerId( response.lecturerId() );
        lecturer.fullName( response.fullName() );
        lecturer.department( response.department() );

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
}
