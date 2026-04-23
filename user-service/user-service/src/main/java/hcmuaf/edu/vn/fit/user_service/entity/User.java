package hcmuaf.edu.vn.fit.user_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
@Builder
@AllArgsConstructor
@NoArgsConstructor

@Setter
@Getter
public class User {
    @Id
    private String userId; //  là MSSV
    private String username;

    private String passwordHash;
    private String email;
    private String role; // STUDENT, TEACHER
    private String authProvider; // LOCAL, GOOGLE
    private String googleId;
    @Column(name = "avatar_url")
    private String avatarUrl;

    private String resetOtp;
    private LocalDateTime resetOtpExpiry;
}
