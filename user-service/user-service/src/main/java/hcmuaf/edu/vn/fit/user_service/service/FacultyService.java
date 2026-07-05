package hcmuaf.edu.vn.fit.user_service.service;

import hcmuaf.edu.vn.fit.user_service.dto.response.FacultyResponse;
import hcmuaf.edu.vn.fit.user_service.entity.Faculty;
import hcmuaf.edu.vn.fit.user_service.entity.User;
import hcmuaf.edu.vn.fit.user_service.repository.FacultyRepository;
import hcmuaf.edu.vn.fit.user_service.exception.ResourceNotFoundException;
import hcmuaf.edu.vn.fit.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;

    public List<FacultyResponse> getAllFaculties() {
        return facultyRepository.findAll().stream()
                .map(f -> FacultyResponse.builder()
                        .facultyId(f.getFacultyId())
                        .facultyName(f.getFacultyName())
                        .deanName(f.getDeanName())
                        .email(f.getEmail())

                        .deanUserId(f.getDeanUser() != null ? f.getDeanUser().getUserId() : null)
                        .build())
                .collect(Collectors.toList());
    }

    public Faculty createFaculty(Faculty faculty) {
        return facultyRepository.save(faculty);
    }

    public Faculty updateFaculty(String id, Faculty facultyDetails) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Khoa với mã: " + id));
        faculty.setFacultyName(facultyDetails.getFacultyName());
        faculty.setDeanName(facultyDetails.getDeanName());
        faculty.setEmail(facultyDetails.getEmail());


        if (facultyDetails.getDeanUser() != null) {
            User dean = userRepository.findById(facultyDetails.getDeanUser().getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy User"));
            faculty.setDeanUser(dean);
        }

        return facultyRepository.save(faculty);
    }

    public void deleteFaculty(String id) {
        if (!facultyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy Khoa với mã: " + id);
        }
        facultyRepository.deleteById(id);
    }
}