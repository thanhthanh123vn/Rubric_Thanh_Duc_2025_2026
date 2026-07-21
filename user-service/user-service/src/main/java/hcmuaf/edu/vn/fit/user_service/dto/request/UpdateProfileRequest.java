
package hcmuaf.edu.vn.fit.user_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    String studentId;
    String fullName;
    LocalDate dateOfBirth;
    String nationality;
    String className;
    String cccd;
    String gender;
    String phoneNumber;
    String address;
}