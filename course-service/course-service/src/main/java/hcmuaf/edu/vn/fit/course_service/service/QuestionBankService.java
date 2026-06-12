package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.QuestionBankRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.QuestionBankResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.QuestionBank;
import hcmuaf.edu.vn.fit.course_service.exception.BadRequestException;
import hcmuaf.edu.vn.fit.course_service.exception.ResourceNotFoundException;
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


    private QuestionBankResponse mapToResponse(QuestionBank bank) {
        return QuestionBankResponse.builder()
                .id(bank.getId()) // Kế thừa từ AbstractEntity
                .name(bank.getName())

                .offeringId(bank.getOfferingId())
                .lecturerId(bank.getLecturerId())
                .build();
    }

    // 1. Tạo kho câu hỏi mới
    public QuestionBankResponse createQuestionBank(
            QuestionBankRequest request,
            String lecturerId
    ) {

        QuestionBank bank = QuestionBank.builder()
                .name(request.getName())
                .offeringId(request.getOfferingId())
                .lecturerId(lecturerId)
                .build();

        QuestionBank savedBank =
                questionBankRepository.save(bank);

        return mapToResponse(savedBank);
    }

    // 2. Cập nhật tên kho câu hỏi
    public QuestionBankResponse updateQuestionBank(String id, QuestionBankRequest request) {
        QuestionBank bank = questionBankRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kho câu hỏi với ID: " + id));

        bank.setName(request.getName());
        QuestionBank updatedBank = questionBankRepository.save(bank);
        return mapToResponse(updatedBank); // Trả về DTO
    }

    // 3. Xóa kho câu hỏi (Giữ nguyên vì hàm này trả về void)
    public void deleteQuestionBank(String id) {
        if (!questionBankRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy kho câu hỏi để xóa");
        }
        // TODO: Cần kiểm tra xem kho này có đang chứa câu hỏi nào không trước khi xóa
        questionBankRepository.deleteById(id);
    }

    // 4. Lấy danh sách kho theo môn học
    public List<QuestionBankResponse> getBanksByOfferingId(String offeringId) {

        List<QuestionBank> banks = questionBankRepository.findByOfferingId(offeringId);

        return banks.stream()
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
}