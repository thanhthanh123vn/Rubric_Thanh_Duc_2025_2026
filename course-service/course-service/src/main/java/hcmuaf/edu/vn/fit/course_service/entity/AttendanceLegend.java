package hcmuaf.edu.vn.fit.course_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "attendance_legends")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class AttendanceLegend extends AbstractEntity<String> {

    @Column(name = "offering_id", nullable = false, length = 50)
    private String offeringId;

    @Column(name = "legend_label", nullable = false, length = 100)
    private String legendLabel;

    @Column(name = "color_hex", nullable = false, length = 7)
    private String colorHex;
}
