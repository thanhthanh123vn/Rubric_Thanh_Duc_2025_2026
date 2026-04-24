package hcmuaf.edu.vn.fit.user_service.entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "faculty")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Faculty {

    @Id
    @Column(name = "faculty_id", length = 50)
    private String facultyId;

    @Column(name = "faculty_name", nullable = false)
    private String facultyName;
}