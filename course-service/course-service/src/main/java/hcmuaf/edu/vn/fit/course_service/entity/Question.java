package hcmuaf.edu.vn.fit.course_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import hcmuaf.edu.vn.fit.course_service.entity.enums.Difficulty;
import hcmuaf.edu.vn.fit.course_service.entity.enums.QuestionType;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Question extends AbstractEntity {

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;


    @Column(name = "offering_id")
    private String offeringId;

    // Liên kết với các đáp án (dành cho câu trắc nghiệm)
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AnswerOption> options = new ArrayList<>();


    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "question_clo",
            joinColumns = @JoinColumn(name = "question_id"),
            inverseJoinColumns = @JoinColumn(name = "clo_id")
    )
    @Builder.Default
    private List<CourseCLO> clos = new ArrayList<>();

    // Helper method để thêm đáp án đồng bộ
    public void addOption(AnswerOption option) {
        options.add(option);
        option.setQuestion(this);
    }
}


