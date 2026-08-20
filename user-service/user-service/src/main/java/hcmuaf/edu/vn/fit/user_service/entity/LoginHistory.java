package hcmuaf.edu.vn.fit.user_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;

    private String ipAddress;

    @Column(columnDefinition = "TEXT")
    private String userAgent;

    private LocalDateTime loginAt;

    private String status; // SUCCESS, FAILED

    private Boolean suspicious;
}