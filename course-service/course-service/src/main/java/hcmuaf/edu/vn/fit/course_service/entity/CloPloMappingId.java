package hcmuaf.edu.vn.fit.course_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class CloPloMappingId implements Serializable {
    @Column(name = "clo_id", length = 50)
    private String cloId;

    @Column(name = "plo_id", length = 50)
    private String ploId;
}
