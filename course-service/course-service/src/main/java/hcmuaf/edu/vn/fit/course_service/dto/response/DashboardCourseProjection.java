package hcmuaf.edu.vn.fit.course_service.dto.response;

public interface DashboardCourseProjection {
    String getOfferingId();
    String getLecturerId();
    String getCourseCode();
    String getCourseName();
    Integer getCredits();
    String getSemester();
    String getAcademicYear();
    String getFullName();
}