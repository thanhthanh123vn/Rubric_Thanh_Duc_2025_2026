package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.response.SyllabusFileDTO;
import hcmuaf.edu.vn.fit.course_service.entity.Course;
import hcmuaf.edu.vn.fit.course_service.entity.SyllabusFile;
import hcmuaf.edu.vn.fit.course_service.exception.ResourceNotFoundException;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.SyllabusFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SyllabusService {

    private final SyllabusFileRepository syllabusRepository;
    private final CourseRepository courseRepository; // Cần inject thêm repo này

    @Transactional
    public SyllabusFileDTO saveSyllabusInfo(String courseId, String fileUrl, String fileName) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học với ID: " + courseId));

        // 2. Tạo đối tượng SyllabusFile
        SyllabusFile file = SyllabusFile.builder()
                .course(course) // Gắn thực thể Course vào
                .fileUrl(fileUrl)
                .fileName(fileName)
                .build();

        SyllabusFile savedFile = syllabusRepository.save(file);

        return mapToDTO(savedFile);
    }

    public List<SyllabusFileDTO> getByCourseId(String courseId) {
        return syllabusRepository.findByCourse_CourseId(courseId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteSyllabus(String fileId) {
        if (!syllabusRepository.existsById(fileId)) {
            throw new ResourceNotFoundException("Không tìm thấy file với ID: " + fileId);
        }
        syllabusRepository.deleteById(fileId);
    }

    private SyllabusFileDTO mapToDTO(SyllabusFile file) {
        return SyllabusFileDTO.builder()
                .id(file.getId())
                .fileName(file.getFileName())
                .fileUrl(file.getFileUrl())
                .courseId(file.getCourse() != null ? file.getCourse().getCourseId() : null)
                .build();
    }
}