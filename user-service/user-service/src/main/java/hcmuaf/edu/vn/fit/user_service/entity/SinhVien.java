package hcmuaf.edu.vn.fit.user_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "SinhVien")

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class SinhVien {
    @Id
    private String studentId;
    private String fullName;
    private String className;
    private String major;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}