package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.Lecturer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LecturerRepository extends JpaRepository<Lecturer,String> {
    Optional<Lecturer> findByUser_UserId(String userId);

}
