package hcmuaf.edu.vn.fit.course_service.entity;

import hcmuaf.edu.vn.fit.course_service.entity.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "group_tasks")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GroupTask {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    private String title;
    private String description;

    private String assigneeId;
    private Boolean assignToGroup;
    private String assignerId;

    @Enumerated(EnumType.STRING)
    private TaskStatus status;

    private LocalDateTime deadline;
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = TaskStatus.TODO;
        if (this.assignToGroup == null) this.assignToGroup = false;
    }
}
