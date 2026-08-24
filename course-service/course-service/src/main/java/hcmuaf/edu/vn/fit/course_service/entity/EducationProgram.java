package hcmuaf.edu.vn.fit.course_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "program")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EducationProgram {
    @Id
    @Column(name = "program_id", length = 50)
    private String programId;

    @Column(name = "program_code", nullable = false, unique = true, length = 30)
    private String programCode;

    @Column(name = "program_name", nullable = false)
    private String programName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
