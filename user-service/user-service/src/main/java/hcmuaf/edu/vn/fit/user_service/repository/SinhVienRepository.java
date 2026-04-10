package hcmuaf.edu.vn.fit.user_service.repository;

import hcmuaf.edu.vn.fit.user_service.entity.SinhVien;
import hcmuaf.edu.vn.fit.user_service.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SinhVienRepository extends JpaRepository<SinhVien, String> {
    Optional<SinhVien> findByUser(User user);
    @Query("SELECT s FROM SinhVien s WHERE " +
            "LOWER(s.studentId) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.phoneNumber) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<SinhVien> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}