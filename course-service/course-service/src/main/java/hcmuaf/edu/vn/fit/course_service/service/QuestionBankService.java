package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.QuestionBankRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.QuestionBankResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.QuestionResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Course;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.Question;
import hcmuaf.edu.vn.fit.course_service.entity.QuestionBank;
import hcmuaf.edu.vn.fit.course_service.exception.BadRequestException;
import hcmuaf.edu.vn.fit.course_service.exception.ResourceNotFoundException;
import hcmuaf.edu.vn.fit.course_service.mapper.QuestionMapper;
import hcmuaf.edu.vn.fit.course_service.repository.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.QuestionBankRepository;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionBankService {

    private final QuestionBankRepository questionBankRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final UserClient userClient;
    private final QuestionService questionService;
    private final QuestionMapper questionMapper;



    private String resolveCourseName(String offeringId) {
        return courseOfferingRepository.findById(offeringId)
                .map(CourseOffering::getCourse)
                .filter(Objects::nonNull)
                .map(course -> course.getCourseName())
                .orElse("");
    }

    private QuestionBankResponse mapToResponse(QuestionBank bank) {
        return QuestionBankResponse.builder()
                .id(bank.getId())
                .name(bank.getName())
                .offeringId(bank.getOfferingId())
                .lecturerId(bank.getLecturerId())
                .isPublic(Boolean.TRUE.equals(bank.getIsPublic()))
                .courseName(resolveCourseName(bank.getOfferingId()))
                .sharePermissions(bank.getSharePermissions())
                .build();
    }

    public QuestionBankResponse createQuestionBank(QuestionBankRequest request, String lecturerId) {
       CourseOffering courseOffering = courseOfferingRepository.findById(request.getOfferingId()).orElseThrow();
        QuestionBank bank = QuestionBank.builder()
                .name(request.getName())
                .offeringId(request.getOfferingId())
                .courseId(courseOffering.getCourse().getCourseId())
                .lecturerId(lecturerId)
                .isPublic(Boolean.TRUE.equals(request.getIsPublic()))
                .sharePermissions(Boolean.TRUE.equals(request.getIsPublic()) ? request.getSharePermissions() : List.of())
                .build();

        return mapToResponse(questionBankRepository.save(bank));
    }

    public QuestionBankResponse updateQuestionBank(String id, QuestionBankRequest request, String lecturerId) {
        QuestionBank bank = questionBankRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kho câu hỏi với ID: " + id));

        if (!Objects.equals(bank.getLecturerId(), lecturerId)) {
            throw new RuntimeException("Bạn không có quyền cập nhật kho câu hỏi này");
        }

        bank.setName(request.getName());
        bank.setIsPublic(Boolean.TRUE.equals(request.getIsPublic()));
        bank.setSharePermissions(Boolean.TRUE.equals(request.getIsPublic()) ? request.getSharePermissions() : List.of());
        return mapToResponse(questionBankRepository.save(bank));
    }

    public void deleteQuestionBank(String id, String lecturerId) {
        QuestionBank bank = questionBankRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kho câu hỏi để xóa"));

        if (!Objects.equals(bank.getLecturerId(), lecturerId)) {
            throw new RuntimeException("Bạn không có quyền xóa kho câu hỏi này");
        }

        questionBankRepository.deleteById(id);
    }

    public List<QuestionBankResponse> getBanksByOfferingId(String offeringId) {
        return questionBankRepository.findByOfferingId(offeringId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<QuestionBankResponse> getBanksByLecturer(String lecturerId) {
        return questionBankRepository.findByLecturerId(lecturerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<QuestionBankResponse> getPublicBanks(String lecturerId) {
        return questionBankRepository.findByIsPublicTrueAndLecturerIdNot(lecturerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<QuestionBankResponse> getQuestionsByLecturerUserId(String userId) {


        if (userId == null || userId.trim().isEmpty()) {
            throw new BadRequestException("User ID không được để trống");
        }
        LecturerResponse lecturer = userClient.getLecturerByUserId(userId);
        if (lecturer == null || lecturer.getLecturerId() == null) {
            throw new ResourceNotFoundException("Không tìm thấy thông tin giảng viên");
        }
        String lecturerId = lecturer.getLecturerId();


        List<CourseOffering> courseOfferings = courseOfferingRepository.findByLecturerIdsContaining(lecturerId);


        Set<String> courseIds = courseOfferings.stream()
                .filter(o -> o.getCourse() != null)
                .map(o -> o.getCourse().getCourseId())
                .collect(Collectors.toSet());


        List<CourseOffering> allOfferingsOfCourses = courseOfferingRepository.findByCourse_CourseIdIn(courseIds);

        Set<String> allOfferingIds = allOfferingsOfCourses.stream()
                .map(CourseOffering::getOfferingId)
                .collect(Collectors.toSet());


        List<QuestionBank> banks = questionBankRepository.findAllByOfferingIdIn(allOfferingIds);


        return banks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<QuestionBankResponse> getAllQuestionBanks(String userId) {

        if (userId == null || userId.trim().isEmpty()) {
            throw new BadRequestException("User ID không được để trống");
        }

        UserResponse user = userClient.getUser(userId);
        if (user == null) {
            throw new NotFoundException("Không tìm thấy người dùng");
        }

        if (!user.getRole().equals("HEAD_OF_DEPARTMENT")
                && !user.getRole().equals("ADMIN")) {
            throw new ForbiddenException("Bạn không có quyền truy cập");
        }

        List<QuestionBank> banks = questionBankRepository.findAll();

        return banks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<QuestionBankResponse> getBanksByOfferingIdForDep(String offeringId) {

        Optional<CourseOffering> courseOfferings = courseOfferingRepository.findById(offeringId);


        Set<String> courseIds = courseOfferings.stream()
                .filter(o -> o.getCourse() != null)
                .map(o -> o.getCourse().getCourseId())
                .collect(Collectors.toSet());

        List<CourseOffering> allOfferingsOfCourses = courseOfferingRepository.findByCourse_CourseIdIn(courseIds);

        Set<String> allOfferingIds = allOfferingsOfCourses.stream()
                .map(CourseOffering::getOfferingId)
                .collect(Collectors.toSet());

        List<QuestionBank> banks = questionBankRepository.findByOfferingId(offeringId);

        return banks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());


    }
    public List<QuestionBankResponse> getPublicQuestionBanks(String offeringId) {

        Optional<CourseOffering> courseOfferingOpt = courseOfferingRepository.findById(offeringId);
        if (courseOfferingOpt.isEmpty() || courseOfferingOpt.get().getCourse() == null) {
            return Collections.emptyList();
        }


        String courseId = courseOfferingOpt.get().getCourse().getCourseId();


        List<CourseOffering> allOfferingsOfCourse = courseOfferingRepository.findByCourse_CourseIdIn(Set.of(courseId));
        Set<String> allOfferingIds = allOfferingsOfCourse.stream()
                .map(CourseOffering::getOfferingId)
                .collect(Collectors.toSet());


        List<QuestionBank> publicBanks = questionBankRepository.findByIsPublicTrueAndOfferingIdIn(allOfferingIds);

        // 5. Map sang Response
        return publicBanks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    public List<QuestionBankResponse> getBanksPublicByOfferingIdForDep(String offeringId) {

        Optional<CourseOffering> courseOfferings = courseOfferingRepository.findById(offeringId);


        Set<String> courseIds = courseOfferings.stream()
                .filter(o -> o.getCourse() != null)
                .map(o -> o.getCourse().getCourseId())
                .collect(Collectors.toSet());

        List<CourseOffering> allOfferingsOfCourses = courseOfferingRepository.findByCourse_CourseIdIn(courseIds);

        Set<String> allOfferingIds = allOfferingsOfCourses.stream()
                .map(CourseOffering::getOfferingId)
                .collect(Collectors.toSet());

        List<QuestionBank> banks = questionBankRepository.findByIsPublicTrueAndOfferingId(offeringId);

        return banks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());


    }
    public QuestionBank updatePublicStatus(String bankId, boolean isPublic) {
        QuestionBank bank = questionBankRepository.findById(bankId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Bank"));
        bank.setIsPublic(isPublic);
        return questionBankRepository.save(bank);
    }
}
