package hcmuaf.edu.vn.fit.course_service.entity.enums;


public enum GradeStatus {
    PENDING,      // Chưa có điểm / đang chờ chấm
    DRAFT,        // Giảng viên lưu nháp
    GRADED,       // Đã chấm xong
    PUBLISHED,    // Đã công bố cho sinh viên
    UPDATED,      // Điểm đã được cập nhật
    REVIEWING,    // Đang phúc khảo
    FINALIZED     // Điểm đã chốt
}