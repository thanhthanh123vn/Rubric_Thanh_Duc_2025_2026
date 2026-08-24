package hcmuaf.edu.vn.fit.course_service.entity;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "clo_plo_mapping")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloPloMapping {
    @EmbeddedId
    private CloPloMappingId id;
}
