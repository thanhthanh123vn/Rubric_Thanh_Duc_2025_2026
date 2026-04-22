package hcmuaf.edu.vn.fit.user_service.repository;

import hcmuaf.edu.vn.fit.user_service.entity.Lecturer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LecturerRepository extends JpaRepository<Lecturer, String> {
    Optional<Lecturer> findByUser_UserId(String userId);
}
