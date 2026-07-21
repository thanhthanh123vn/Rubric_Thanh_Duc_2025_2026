package hcmuaf.edu.vn.fit.course_service.controller;

import hcmuaf.edu.vn.fit.course_service.dto.response.*;
import hcmuaf.edu.vn.fit.course_service.service.AdminReportService;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/course-service/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final AdminReportService adminReportService;

    @GetMapping("/overview")
    public ResponseEntity<OverviewReportResponse> overview(@RequestParam String semester) {
        return ResponseEntity.ok(adminReportService.getOverview(semester));
    }

    @GetMapping("/grade-distribution")
    public ResponseEntity<List<GradeDistributionItem>> gradeDistribution(@RequestParam String semester) {
        return ResponseEntity.ok(adminReportService.getGradeDistribution(semester));
    }

    @GetMapping("/offering-performance")
    public ResponseEntity<List<OfferingPerformanceItem>> offeringPerformance(
            @RequestParam String semester,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "desc") String sort
    ) {
        return ResponseEntity.ok(adminReportService.getOfferingPerformance(semester, limit, sort));
    }

    @GetMapping("/department-summary")
    public ResponseEntity<List<DepartmentSummaryItem>> departmentSummary(@RequestParam String semester) {
        return ResponseEntity.ok(adminReportService.getDepartmentSummary(semester));
    }

    @GetMapping("/semester-trend")
    public ResponseEntity<List<SemesterTrendItem>> semesterTrend(
            @RequestParam String from,
            @RequestParam String to
    ) {
        return ResponseEntity.ok(adminReportService.getSemesterTrend(from, to));
    }

    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> export(
            @RequestParam String semester,
            @RequestParam(defaultValue = "excel") String type
    ) {
        ExportFile file = adminReportService.exportReport(semester, type);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .contentType(MediaType.parseMediaType(file.getContentType()))
                .body(new InputStreamResource(file.getInputStream()));
    }
}