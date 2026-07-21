package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.response.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminReportService {

    private final EntityManager entityManager;

    public OverviewReportResponse getOverview(String semester) {
        long totalCourses = getLong("""
            SELECT COUNT(DISTINCT co.course_id)
            FROM course_offering co
            WHERE co.semester = :semester
        """, semester);

        long totalOfferings = getLong("""
            SELECT COUNT(*)
            FROM course_offering co
            WHERE co.semester = :semester
        """, semester);

        long totalStudents = getLong("""
            SELECT COUNT(DISTINCT g.student_id)
            FROM gradebook_score g
            JOIN course_offering co ON co.offering_id = g.offering_id
            WHERE co.semester = :semester
        """, semester);

        Double avgFinalScore = getDouble("""
            SELECT AVG(g.final_score)
            FROM gradebook_score g
            JOIN course_offering co ON co.offering_id = g.offering_id
            WHERE co.semester = :semester
        """, semester);

        long passed = getLong("""
            SELECT COUNT(*)
            FROM gradebook_score g
            JOIN course_offering co ON co.offering_id = g.offering_id
            WHERE co.semester = :semester AND g.final_score >= 4
        """, semester);

        long failed = getLong("""
            SELECT COUNT(*)
            FROM gradebook_score g
            JOIN course_offering co ON co.offering_id = g.offering_id
            WHERE co.semester = :semester AND g.final_score < 4
        """, semester);

        double total = passed + failed;
        double passRate = total == 0 ? 0 : passed / total;
        double failRate = total == 0 ? 0 : failed / total;

        return OverviewReportResponse.builder()
                .totalCourses(totalCourses)
                .totalOfferings(totalOfferings)
                .totalStudents(totalStudents)
                .avgFinalScore(avgFinalScore == null ? 0 : round2(avgFinalScore))
                .passRate(round4(passRate))
                .failRate(round4(failRate))
                .build();
    }

    public List<GradeDistributionItem> getGradeDistribution(String semester) {
        Query query = entityManager.createNativeQuery("""
            SELECT
                CASE
                    WHEN g.final_score >= 8.5 THEN 'A'
                    WHEN g.final_score >= 8.0 THEN 'B+'
                    WHEN g.final_score >= 7.0 THEN 'B'
                    WHEN g.final_score >= 6.5 THEN 'C+'
                    WHEN g.final_score >= 5.5 THEN 'C'
                    WHEN g.final_score >= 4.0 THEN 'D'
                    ELSE 'F'
                END AS grade,
                COUNT(*) AS cnt
            FROM gradebook_score g
            JOIN course_offering co ON co.offering_id = g.offering_id
            WHERE co.semester = :semester
            GROUP BY grade
            ORDER BY grade
        """);
        query.setParameter("semester", semester);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();

        List<GradeDistributionItem> result = new ArrayList<>();
        for (Object[] r : rows) {
            result.add(GradeDistributionItem.builder()
                    .grade(String.valueOf(r[0]))
                    .count(((Number) r[1]).longValue())
                    .build());
        }
        return result;
    }

    public List<OfferingPerformanceItem> getOfferingPerformance(String semester, int limit, String sort) {
        String order = "asc".equalsIgnoreCase(sort) ? "ASC" : "DESC";
        Query query = entityManager.createNativeQuery("""
            SELECT
                co.offering_id,
                co.offering_name,
                c.course_code,
                AVG(g.final_score) AS avg_score,
                AVG(CASE WHEN g.final_score >= 4 THEN 1.0 ELSE 0.0 END) AS pass_rate,
                COUNT(g.student_id) AS student_count
            FROM course_offering co
            JOIN course c ON c.course_id = co.course_id
            LEFT JOIN gradebook_score g ON g.offering_id = co.offering_id
            WHERE co.semester = :semester
            GROUP BY co.offering_id, co.offering_name, c.course_code
            ORDER BY avg_score """ + order + """
            LIMIT :limit
        """);
        query.setParameter("semester", semester);
        query.setParameter("limit", limit);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();

        List<OfferingPerformanceItem> result = new ArrayList<>();
        for (Object[] r : rows) {
            result.add(OfferingPerformanceItem.builder()
                    .offeringId(str(r[0]))
                    .offeringName(str(r[1]))
                    .courseCode(str(r[2]))
                    .avgScore(round2(num(r[3])))
                    .passRate(round4(num(r[4])))
                    .studentCount((long) num(r[5]))
                    .build());
        }
        return result;
    }

    public List<DepartmentSummaryItem> getDepartmentSummary(String semester) {
        Query query = entityManager.createNativeQuery("""
            SELECT
                c.department AS department,
                COUNT(DISTINCT co.offering_id) AS offerings,
                COUNT(DISTINCT g.student_id) AS students,
                AVG(g.final_score) AS avg_score,
                AVG(CASE WHEN g.final_score >= 4 THEN 1.0 ELSE 0.0 END) AS pass_rate
            FROM course_offering co
            JOIN course c ON c.course_id = co.course_id
            LEFT JOIN gradebook_score g ON g.offering_id = co.offering_id
            WHERE co.semester = :semester
            GROUP BY c.department
            ORDER BY c.department
        """);
        query.setParameter("semester", semester);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();

        List<DepartmentSummaryItem> result = new ArrayList<>();
        for (Object[] r : rows) {
            result.add(DepartmentSummaryItem.builder()
                    .department(str(r[0]))
                    .offerings((long) num(r[1]))
                    .students((long) num(r[2]))
                    .avgScore(round2(num(r[3])))
                    .passRate(round4(num(r[4])))
                    .build());
        }
        return result;
    }

    public List<SemesterTrendItem> getSemesterTrend(String from, String to) {
        Query query = entityManager.createNativeQuery("""
            SELECT
                co.semester,
                AVG(g.final_score) AS avg_score,
                AVG(CASE WHEN g.final_score >= 4 THEN 1.0 ELSE 0.0 END) AS pass_rate
            FROM course_offering co
            LEFT JOIN gradebook_score g ON g.offering_id = co.offering_id
            WHERE co.semester >= :fromSemester AND co.semester <= :toSemester
            GROUP BY co.semester
            ORDER BY co.semester
        """);
        query.setParameter("fromSemester", from);
        query.setParameter("toSemester", to);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();

        List<SemesterTrendItem> result = new ArrayList<>();
        for (Object[] r : rows) {
            result.add(SemesterTrendItem.builder()
                    .semester(str(r[0]))
                    .avgScore(round2(num(r[1])))
                    .passRate(round4(num(r[2])))
                    .build());
        }
        return result;
    }

    public ExportFile exportReport(String semester, String type) {
        // tạm export CSV để chạy nhanh
        StringBuilder csv = new StringBuilder();
        csv.append("Semester,TotalCourses,TotalOfferings,TotalStudents,AvgFinalScore,PassRate,FailRate\n");
        OverviewReportResponse o = getOverview(semester);
        csv.append(semester).append(",")
                .append(o.getTotalCourses()).append(",")
                .append(o.getTotalOfferings()).append(",")
                .append(o.getTotalStudents()).append(",")
                .append(o.getAvgFinalScore()).append(",")
                .append(o.getPassRate()).append(",")
                .append(o.getFailRate()).append("\n");

        InputStream in = new ByteArrayInputStream(csv.toString().getBytes(StandardCharsets.UTF_8));
        return ExportFile.builder()
                .filename("admin-report-" + semester + ".csv")
                .contentType("text/csv")
                .inputStream(in)
                .build();
    }

    private long getLong(String sql, String semester) {
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("semester", semester);
        Number number = (Number) query.getSingleResult();
        return number == null ? 0 : number.longValue();
    }

    private Double getDouble(String sql, String semester) {
        Query query = entityManager.createNativeQuery(sql);
        query.setParameter("semester", semester);
        Object obj = query.getSingleResult();
        return obj == null ? null : ((Number) obj).doubleValue();
    }

    private static String str(Object o) {
        return o == null ? "" : String.valueOf(o);
    }

    private static double num(Object o) {
        return o == null ? 0 : ((Number) o).doubleValue();
    }

    private static double round2(double x) {
        return Math.round(x * 100.0) / 100.0;
    }

    private static double round4(double x) {
        return Math.round(x * 10000.0) / 10000.0;
    }
}