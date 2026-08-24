package hcmuaf.edu.vn.fit.course_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "program_plo")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramPlo {
    @Id
    @Column(name = "plo_id", length = 50)
    private String ploId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "program_id", nullable = false)
    private EducationProgram program;

    @Column(name = "plo_code", nullable = false, length = 20)
    private String ploCode;

    @Column(name = "plo_name", nullable = false)
    private String ploName;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "clo_plo_mapping",
            joinColumns = @JoinColumn(name = "plo_id"),
            inverseJoinColumns = @JoinColumn(name = "clo_id")
    )
    @Builder.Default
    private Set<CourseCLO> courseClos = new LinkedHashSet<>();
}
