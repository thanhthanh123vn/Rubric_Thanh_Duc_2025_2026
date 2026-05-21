package hcmuaf.edu.vn.fit.grading_service.entity;

import lombok.Data;

@Data
public  class CriteriaGrade {
    private String criteriaId;
    private String levelId;
    private Double scoreAchieved;
}