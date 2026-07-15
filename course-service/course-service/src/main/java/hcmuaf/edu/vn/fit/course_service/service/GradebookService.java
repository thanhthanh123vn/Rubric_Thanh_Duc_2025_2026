package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.GradebookConfigRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.GradebookScoreRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.CourseGradebookResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.GradebookStudentResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.SinhVienResponse;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.Enrollment;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;

@Service
@RequiredArgsConstructor
public class GradebookService {
    private static final double DEFAULT_ATTENDANCE_WEIGHT = 10.0;
    private static final double DEFAULT_ASSIGNMENT_WEIGHT = 40.0;

    private final CourseOfferingRepository offeringRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserClient userClient;

    @Transactional(readOnly = true)
    public CourseGradebookResponse getGradebook(String offeringId) {
        CourseOffering offering = getOffering(offeringId);
        List<GradebookStudentResponse> students = enrollmentRepository
                .findByCourseOffering_OfferingId(offeringId)
                .stream()
                .map(this::toStudentResponse)
                .sorted(Comparator.comparing(GradebookStudentResponse::getStudentId))
                .toList();

        return CourseGradebookResponse.builder()
                .offeringId(offeringId)
                .attendanceWeight(attendanceWeight(offering))
                .assignmentWeight(assignmentWeight(offering))
                .componentWeight(componentWeight(offering))
                .examWeight(examWeight(offering))
                .students(students)
                .build();
    }

    @Transactional
    public CourseGradebookResponse updateConfig(String offeringId, GradebookConfigRequest request) {
        validateWeights(request.getAttendanceWeight(), request.getAssignmentWeight());
        CourseOffering offering = getOffering(offeringId);
        offering.setAttendanceScoreWeight(round(request.getAttendanceWeight()));
        offering.setAssignmentScoreWeight(round(request.getAssignmentWeight()));
        offeringRepository.save(offering);
        recalculateAll(offeringId, offering);
        return getGradebook(offeringId);
    }

    @Transactional
    public CourseGradebookResponse updateScores(String offeringId, List<GradebookScoreRequest> requests) {
        CourseOffering offering = getOffering(offeringId);
        for (GradebookScoreRequest request : requests) {
            validateScore(request.getAttendanceScore(), "Điểm chuyên cần");
            validateScore(request.getAssignmentScore(), "Điểm bài tập");
            validateScore(request.getExamScore(), "Điểm thi");
            Enrollment enrollment = enrollmentRepository
                    .findByStudentIdAndCourseOffering_OfferingId(request.getStudentId(), offeringId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Sinh viên " + request.getStudentId() + " không thuộc lớp học phần"));
            if (request.getAttendanceWarningCount() != null) {
                if (request.getAttendanceWarningCount() < 0) {
                    throw new IllegalArgumentException("Số lần bị nhắc nhở không được nhỏ hơn 0");
                }
                enrollment.setAttendanceWarningCount(request.getAttendanceWarningCount());
            }
            applyScores(enrollment, request.getAttendanceScore(), request.getAssignmentScore(), request.getExamScore(), offering);
            enrollmentRepository.save(enrollment);
        }
        return getGradebook(offeringId);
    }

    @Transactional
    public Map<String, Object> importExcel(String offeringId, MultipartFile file) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("File Excel không được để trống");
        CourseOffering offering = getOffering(offeringId);
        int imported = 0;
        List<String> errors = new ArrayList<>();
        DataFormatter formatter = new DataFormatter();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null) continue;
                String studentId = formatter.formatCellValue(row.getCell(0)).trim();
                if (studentId.isEmpty()) continue;
                try {
                    Double attendanceScore = parseScore(formatter.formatCellValue(row.getCell(2)), "Điểm chuyên cần");
                    Double assignmentScore = parseScore(formatter.formatCellValue(row.getCell(3)), "Điểm bài tập");
                    Double examScore = parseScore(formatter.formatCellValue(row.getCell(4)), "Điểm thi");
                    Enrollment enrollment = enrollmentRepository
                            .findByStudentIdAndCourseOffering_OfferingId(studentId, offeringId)
                            .orElseThrow(() -> new IllegalArgumentException("MSSV không thuộc lớp"));
                    applyScores(enrollment, attendanceScore, assignmentScore, examScore, offering);
                    enrollmentRepository.save(enrollment);
                    imported++;
                } catch (Exception exception) {
                    errors.add("Dòng " + (rowIndex + 1) + " (" + studentId + "): " + exception.getMessage());
                }
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("imported", imported);
        result.put("errors", errors);
        result.put("gradebook", getGradebook(offeringId));
        return result;
    }

    @Transactional(readOnly = true)
    public byte[] createTemplate(String offeringId) throws IOException {
        CourseGradebookResponse gradebook = getGradebook(offeringId);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Bang diem");
            Row header = sheet.createRow(0);
            String[] titles = {"MSSV", "Họ và tên", "Điểm chuyên cần", "Điểm bài tập", "Điểm thi"};
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            for (int i = 0; i < titles.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(titles[i]);
                cell.setCellStyle(headerStyle);
            }
            int rowIndex = 1;
            for (GradebookStudentResponse student : gradebook.getStudents()) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(student.getStudentId());
                row.createCell(1).setCellValue(student.getFullName());
                if (student.getAttendanceScore() != null) row.createCell(2).setCellValue(student.getAttendanceScore());
                if (student.getAssignmentScore() != null) row.createCell(3).setCellValue(student.getAssignmentScore());
                if (student.getExamScore() != null) row.createCell(4).setCellValue(student.getExamScore());
            }
            sheet.setColumnWidth(0, 18 * 256);
            sheet.setColumnWidth(1, 32 * 256);
            sheet.setColumnWidth(2, 20 * 256);
            sheet.setColumnWidth(3, 18 * 256);
            sheet.setColumnWidth(4, 16 * 256);
            workbook.write(output);
            return output.toByteArray();
        }
    }

    private CourseOffering getOffering(String offeringId) {
        return offeringRepository.findById(offeringId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học phần"));
    }

    private GradebookStudentResponse toStudentResponse(Enrollment enrollment) {
        String fullName = enrollment.getStudentId();
        try {
            SinhVienResponse student = userClient.getSinhVien(enrollment.getStudentId());
            if (student != null && student.getFullName() != null) fullName = student.getFullName();
        } catch (Exception ignored) {
            // Giữ MSSV làm tên hiển thị khi user-service tạm thời không phản hồi.
        }
        return GradebookStudentResponse.builder()
                .studentId(enrollment.getStudentId())
                .fullName(fullName)
                .attendanceScore(toDouble(enrollment.getAttendanceScore()))
                .attendanceWarningCount(enrollment.getAttendanceWarningCount() == null ? 0 : enrollment.getAttendanceWarningCount())
                .assignmentScore(toDouble(enrollment.getAssignmentScore()))
                .componentScore(componentContribution(enrollment, enrollment.getCourseOffering()))
                .examScore(toDouble(enrollment.getFinalScore()))
                .totalScore(toDouble(enrollment.getTotalScore()))
                .letterGrade(enrollment.getLetterGrade())
                .build();
    }

    private void recalculateAll(String offeringId, CourseOffering offering) {
        List<Enrollment> enrollments = enrollmentRepository.findByCourseOffering_OfferingId(offeringId);
        enrollments.forEach(enrollment -> applyScores(
                enrollment,
                toDouble(enrollment.getAttendanceScore()),
                toDouble(enrollment.getAssignmentScore()),
                toDouble(enrollment.getFinalScore()),
                offering));
        enrollmentRepository.saveAll(enrollments);
    }

    private void applyScores(Enrollment enrollment, Double attendanceScore, Double assignmentScore,
                             Double examScore, CourseOffering offering) {
        Double roundedAttendance = attendanceScore == null ? null : round(attendanceScore);
        Double roundedAssignment = assignmentScore == null ? null : round(assignmentScore);
        Double roundedExam = examScore == null ? null : round(examScore);
        enrollment.setAttendanceScore(roundedAttendance == null ? null : roundedAttendance.floatValue());
        enrollment.setAssignmentScore(roundedAssignment == null ? null : roundedAssignment.floatValue());
        enrollment.setFinalScore(roundedExam == null ? null : roundedExam.floatValue());
        if (roundedAttendance == null || roundedAssignment == null || roundedExam == null) {
            enrollment.setMidtermScore(null);
            enrollment.setTotalScore(null);
            enrollment.setLetterGrade(null);
            return;
        }
        double component = round(roundedAttendance * attendanceWeight(offering) / 100.0
                + roundedAssignment * assignmentWeight(offering) / 100.0);
        double componentMaximum = componentWeight(offering);
        enrollment.setMidtermScore(componentMaximum == 0 ? 0F : (float) round(component * 100.0 / componentMaximum));
        double total = round(component
                + roundedExam * examWeight(offering) / 100.0);
        enrollment.setTotalScore((float) total);
        enrollment.setLetterGrade(letterGrade(total));
    }

    private Double parseScore(String value, String label) {
        if (value == null || value.trim().isEmpty()) return null;
        try {
            Double score = Double.parseDouble(value.trim().replace(',', '.'));
            validateScore(score, label);
            return score;
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException(label + " phải là số từ 0 đến 10");
        }
    }

    private void validateScore(Double score, String label) {
        if (score != null && (score < 0 || score > 10 || !Double.isFinite(score))) {
            throw new IllegalArgumentException(label + " phải nằm trong khoảng 0 đến 10");
        }
    }

    private void validateWeights(Double attendanceWeight, Double assignmentWeight) {
        if (attendanceWeight == null || assignmentWeight == null
                || attendanceWeight < 0 || assignmentWeight < 0
                || attendanceWeight > 100 || assignmentWeight > 100
                || attendanceWeight + assignmentWeight > 100) {
            throw new IllegalArgumentException("Tổng tỷ trọng chuyên cần và bài tập phải nằm trong khoảng 0% đến 100%");
        }
    }

    private double attendanceWeight(CourseOffering offering) {
        return offering.getAttendanceScoreWeight() == null
                ? DEFAULT_ATTENDANCE_WEIGHT : offering.getAttendanceScoreWeight();
    }

    private double assignmentWeight(CourseOffering offering) {
        return offering.getAssignmentScoreWeight() == null
                ? DEFAULT_ASSIGNMENT_WEIGHT : offering.getAssignmentScoreWeight();
    }

    private double componentWeight(CourseOffering offering) {
        return attendanceWeight(offering) + assignmentWeight(offering);
    }

    private double examWeight(CourseOffering offering) {
        return 100.0 - componentWeight(offering);
    }

    private Double componentContribution(Enrollment enrollment, CourseOffering offering) {
        Double attendance = toDouble(enrollment.getAttendanceScore());
        Double assignment = toDouble(enrollment.getAssignmentScore());
        if (attendance == null || assignment == null) return null;
        return round(attendance * attendanceWeight(offering) / 100.0
                + assignment * assignmentWeight(offering) / 100.0);
    }

    private Double toDouble(Float value) {
        return value == null ? null : value.doubleValue();
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private String letterGrade(double score) {
        if (score >= 8.5) return "A";
        if (score >= 8.0) return "B+";
        if (score >= 7.0) return "B";
        if (score >= 6.5) return "C+";
        if (score >= 5.5) return "C";
        if (score >= 5.0) return "D+";
        if (score >= 4.0) return "D";
        return "F";
    }
}
