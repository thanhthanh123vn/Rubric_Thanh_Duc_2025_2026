package hcmuaf.edu.vn.fit.user_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Builder
@Data
public class ProfileResponse {
    String studentId;
    String fullName;
    String avatarUrl;
    String className;
    String major;
    LocalDate dateOfBirth;
    String nationality;
    String cccd;
    String gender;
    String phoneNumber;
    String address;
    String email;
}