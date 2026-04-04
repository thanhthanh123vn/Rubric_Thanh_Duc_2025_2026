package hcmuaf.edu.vn.fit.user_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "SinhVien")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SinhVien {

    @Id
    private String studentId;


    private String fullName;
    private String className;
    private String major;


    private LocalDate dateOfBirth;
    private String nationality;
    private String cccd;
    private String gender;

    private String phoneNumber;
    private String address;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}