package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.Data;

import java.time.LocalDate;

@Data
public class LecturerResponse {


            String lecturerId;
            String userId;
            String fullName;
            String email;
            String department;
            String academicTitle;
            LocalDate dateOfBirth;
            String gender;
            String cccd;
            String phoneNumber;
            String address;

    }


