package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.CourseOfferingRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.CourseOfferingResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.FacultyResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerInfo; // Bổ sung class này
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Course;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.mapper.CourseMapper;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseRepository;
import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseOfferingService {

    private final CourseOfferingRepository courseOfferingRepository;
    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;
    private final UserClient userClient;
    private final S3Service s3Service;



    private static final Logger log = LoggerFactory.getLogger(CourseOfferingService.class);
    private static final Set<String> BANNER_COLORS = Set.of(
            "blue", "emerald", "purple", "pink", "orange", "cyan", "indigo", "red"
    );

    @Transactional
    public CourseOfferingResponse updateBannerColor(String offeringId, String userId, String bannerColor) {
        if (bannerColor == null || !BANNER_COLORS.contains(bannerColor)) {
            throw new IllegalArgumentException("Màu banner không hợp lệ");
        }

        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần với ID: " + offeringId));
        LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
        if (lecturer == null || lecturer.getLecturerId() == null
                || offering.getLecturerIds() == null
                || !offering.getLecturerIds().contains(lecturer.getLecturerId())) {
            throw new SecurityException("Bạn không phải giảng viên của lớp học phần này");
        }

        offering.setBannerColor(bannerColor);
        return mapToResponse(courseOfferingRepository.save(offering));
    }

    @Transactional
    public CourseOfferingResponse uploadBannerImage(String offeringId, String userId, MultipartFile file) {
        CourseOffering offering = getOwnedOffering(offeringId, userId);
        if (file == null || file.isEmpty() || file.getContentType() == null
                || !file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Vui lòng chọn một tệp hình ảnh hợp lệ");
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Ảnh banner không được vượt quá 5 MB");
        }

        String oldImageUrl = offering.getBannerImageUrl();
        try {
            offering.setBannerImageUrl(s3Service.uploadFile(file));
            CourseOfferingResponse response = mapToResponse(courseOfferingRepository.save(offering));
            if (oldImageUrl != null && !oldImageUrl.isBlank()) {
                try {
                    s3Service.deleteFile(oldImageUrl);
                } catch (Exception e) {
                    log.warn("Không thể xóa ảnh banner cũ: {}", oldImageUrl, e);
                }
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException("Không thể tải ảnh banner lên", e);
        }
    }

    @Transactional
    public CourseOfferingResponse removeBannerImage(String offeringId, String userId) {
        CourseOffering offering = getOwnedOffering(offeringId, userId);
        String oldImageUrl = offering.getBannerImageUrl();
        offering.setBannerImageUrl(null);
        CourseOfferingResponse response = mapToResponse(courseOfferingRepository.save(offering));
        if (oldImageUrl != null && !oldImageUrl.isBlank()) {
            try {
                s3Service.deleteFile(oldImageUrl);
            } catch (Exception e) {
                log.warn("Không thể xóa ảnh banner: {}", oldImageUrl, e);
            }
        }
        return response;
    }

    private CourseOffering getOwnedOffering(String offeringId, String userId) {
        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần với ID: " + offeringId));
        LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
        if (lecturer == null || lecturer.getLecturerId() == null
                || offering.getLecturerIds() == null
                || !offering.getLecturerIds().contains(lecturer.getLecturerId())) {
            throw new SecurityException("Bạn không phải giảng viên của lớp học phần này");
        }
        return offering;
    }

    public List<CourseOfferingResponse> getOfferingsByCourseId(String courseId) {
        List<CourseOffering> offerings = courseOfferingRepository.findByCourse_CourseId(courseId);

        return offerings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CourseOfferingResponse getOfferingById(String offeringId) {
        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần với ID: " + offeringId));
        return mapToResponse(offering);
    }

    @Transactional
    public CourseOfferingResponse createOffering(String courseId, CourseOfferingRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học với ID: " + courseId));

        List<String> lecturerIds = request.getLecturerIds() == null
                ? new ArrayList<>()
                : new ArrayList<>(request.getLecturerIds());
        String mainLecturerId = request.getLecturerId() != null
                ? request.getLecturerId()
                : (lecturerIds.isEmpty() ? null : lecturerIds.getFirst());
        if (mainLecturerId != null && !lecturerIds.contains(mainLecturerId)) {
            lecturerIds.addFirst(mainLecturerId);
        }
        List<String> assistantIds = lecturerIds.stream()
                .filter(id -> !id.equals(mainLecturerId))
                .distinct()
                .toList();

        CourseOffering offering = CourseOffering.builder()
                .offeringId(UUID.randomUUID().toString())
                .course(course)
                .offeringName(request.getOfferingName())
                .lecturerId(mainLecturerId)
                .mainLecturerId(mainLecturerId)
                .lecturerIds(lecturerIds)
                .teachingAssistantIds(new ArrayList<>(assistantIds))
                .semester(request.getSemester())
                .academicYear(request.getAcademicYear())
                .maxStudents(request.getMaxStudents())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus() != null ? request.getStatus() : "OPEN")
                .build();

        offering = courseOfferingRepository.save(offering);
        return mapToResponse(offering);
    }

    @Transactional
    public CourseOfferingResponse updateOffering(String offeringId, CourseOfferingRequest request) {
        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần với ID: " + offeringId));

        offering.setOfferingName(request.getOfferingName());
        if (request.getLecturerIds() != null) {
            List<String> lecturerIds = new ArrayList<>(request.getLecturerIds());
            String previousMainLecturerId = resolveMainLecturerId(offering);
            String mainLecturerId = request.getLecturerId() != null
                    ? request.getLecturerId()
                    : (lecturerIds.isEmpty() ? null : lecturerIds.getFirst());
            List<String> assistantIds = lecturerIds.size() > 1
                    ? lecturerIds.stream().filter(id -> !id.equals(mainLecturerId)).distinct().toList()
                    : (java.util.Objects.equals(previousMainLecturerId, mainLecturerId)
                    && offering.getTeachingAssistantIds() != null
                    ? new ArrayList<>(offering.getTeachingAssistantIds()) : List.of());
            List<String> managers = new ArrayList<>();
            if (mainLecturerId != null) managers.add(mainLecturerId);
            assistantIds.stream().filter(id -> !managers.contains(id)).forEach(managers::add);
            offering.setLecturerId(mainLecturerId);
            offering.setMainLecturerId(mainLecturerId);
            offering.setTeachingAssistantIds(new ArrayList<>(assistantIds));
            offering.setLecturerIds(managers);
        }
        offering.setSemester(request.getSemester());
        offering.setAcademicYear(request.getAcademicYear());
        offering.setMaxStudents(request.getMaxStudents());
        offering.setStartDate(request.getStartDate());
        offering.setEndDate(request.getEndDate());

        if (request.getStatus() != null) {
            offering.setStatus(request.getStatus());
        }

        offering = courseOfferingRepository.save(offering);
        return mapToResponse(offering);
    }

    @Transactional
    public void deleteOffering(String offeringId) {
        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần với ID: " + offeringId));

        courseOfferingRepository.delete(offering);
    }

    private CourseOfferingResponse mapToResponse(CourseOffering entity) {

        List<LecturerInfo> lecturerInfos = new ArrayList<>();
        String mainLecturerId = resolveMainLecturerId(entity);
        List<String> assistantIds = resolveTeachingAssistantIds(entity, mainLecturerId);
        List<String> managerIds = new ArrayList<>();
        if (mainLecturerId != null) managerIds.add(mainLecturerId);
        assistantIds.stream().filter(id -> !managerIds.contains(id)).forEach(managerIds::add);

        if (!managerIds.isEmpty()) {
            for (String lId : managerIds) {
                try {
                    LecturerResponse lecturer = userClient.getLecturer(lId);
                    lecturerInfos.add(new LecturerInfo(lId, lecturer.getFullName()));
                } catch (Exception e) {
                    log.error("Không thể lấy thông tin giảng viên ID: {}", lId, e);
                    lecturerInfos.add(new LecturerInfo(lId, "Không xác định"));
                }
            }
        }

        return CourseOfferingResponse.builder()
                .offeringId(entity.getOfferingId())
                .offeringName(entity.getOfferingName())
                .course(courseMapper.toCourseResponse(entity.getCourse()))
                .lecturers(lecturerInfos)
                .mainLecturer(mainLecturerId == null ? null : getLecturerInfo(mainLecturerId))
                .teachingAssistants(assistantIds.stream().map(this::getLecturerInfo).toList())
                .semester(entity.getSemester())
                .year(entity.getAcademicYear())
                .maxStudents(entity.getMaxStudents())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .status(entity.getStatus())
                .bannerColor(entity.getBannerColor())
                .bannerImageUrl(entity.getBannerImageUrl())
                .build();
    }

    private String resolveMainLecturerId(CourseOffering offering) {
        if (offering.getMainLecturerId() != null && !offering.getMainLecturerId().isBlank()) {
            return offering.getMainLecturerId();
        }
        if (offering.getLecturerId() != null && !offering.getLecturerId().isBlank()) {
            return offering.getLecturerId();
        }
        return offering.getLecturerIds() == null || offering.getLecturerIds().isEmpty()
                ? null
                : offering.getLecturerIds().getFirst();
    }

    private List<String> resolveTeachingAssistantIds(CourseOffering offering, String mainLecturerId) {
        if (offering.getTeachingAssistantIds() != null && !offering.getTeachingAssistantIds().isEmpty()) {
            return offering.getTeachingAssistantIds().stream()
                    .filter(id -> !id.equals(mainLecturerId))
                    .distinct()
                    .toList();
        }
        if (offering.getLecturerIds() == null) return List.of();
        return offering.getLecturerIds().stream()
                .filter(id -> !id.equals(mainLecturerId))
                .distinct()
                .toList();
    }

    private LecturerInfo getLecturerInfo(String lecturerId) {
        try {
            LecturerResponse lecturer = userClient.getLecturer(lecturerId);
            return new LecturerInfo(lecturerId, lecturer.getFullName());
        } catch (Exception exception) {
            log.error("Cannot load lecturer ID: {}", lecturerId, exception);
            return new LecturerInfo(lecturerId, "Unknown lecturer");
        }
    }

    public List<CourseOfferingResponse> getOfferings() {
        List<CourseOffering> offerings = courseOfferingRepository.findAll();

        return offerings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CourseOfferingResponse> getOfferingsForLeadership(String userId) {
        UserResponse user = userClient.getUser(userId);
        if (user == null) {
            throw new SecurityException("Không xác định được tài khoản lãnh đạo.");
        }

        LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
        if (lecturer == null || lecturer.getDepartment() == null || lecturer.getDepartment().isBlank()) {
            throw new IllegalStateException("Tài khoản lãnh đạo chưa được gắn với bộ môn.");
        }

        List<String> departmentNames;
        if ("DEAN".equals(user.getRole())) {
            FacultyResponse faculty = userClient.getFacultyByDepartmentName(userId, lecturer.getDepartment());
            if (faculty == null || faculty.getFacultyName() == null || faculty.getFacultyName().isBlank()) {
                throw new IllegalStateException("Không xác định được khoa của tài khoản Trưởng khoa.");
            }
            departmentNames = userClient.getDepartmentNamesByFaculty(userId, faculty.getFacultyName());
        } else if ("HEAD_OF_DEPARTMENT".equals(user.getRole())
                || "DEPARTMENT_HEAD".equals(user.getRole())) {
            departmentNames = List.of(lecturer.getDepartment());
        } else {
            throw new SecurityException("Bạn không có quyền xem dữ liệu OBE cấp đơn vị.");
        }

        if (departmentNames == null || departmentNames.isEmpty()) {
            return List.of();
        }

        return courseOfferingRepository.findByCourseDepartmentIn(departmentNames).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<CourseOfferingResponse> getOfferingsByFaculty(String userId, String facultyName) {

        List<String> departmentNames = userClient.getDepartmentNamesByFaculty(userId, facultyName);


        if (departmentNames == null || departmentNames.isEmpty()) {
            return Collections.emptyList();
        }


        List<CourseOffering> offerings = courseOfferingRepository.findByCourseDepartmentIn(departmentNames);


        return offerings.stream()
                 .map(this::mapToResponse)
                .toList();
    }
}
