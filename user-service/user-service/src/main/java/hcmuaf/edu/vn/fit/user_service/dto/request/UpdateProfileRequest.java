
package hcmuaf.edu.vn.fit.user_service.dto.request;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
@Builder
@Data
public class UpdateProfileRequest {
    String fullName;
    LocalDate dateOfBirth;
    String nationality;
    String cccd;
    String gender;
    String phoneNumber;
    String address;
}