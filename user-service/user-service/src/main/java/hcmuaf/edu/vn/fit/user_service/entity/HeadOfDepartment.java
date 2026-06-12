package hcmuaf.edu.vn.fit.user_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "head_of_department")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeadOfDepartment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lecturer_id", nullable = false)
    private Lecturer lecturer;


    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;


    @Column(name = "end_date")
    private LocalDate endDate;


    @Column(name = "status", nullable = false)
    private String status;
}