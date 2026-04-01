package hcmuaf.edu.vn.fit.user_service.repository;

import hcmuaf.edu.vn.fit.user_service.entity.SinhVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SinhVienRepository extends JpaRepository<SinhVien, String> {
    // Bạn có thể thêm các hàm tìm kiếm theo lớp hoặc khoa tại đây
    // Ví dụ: List<SinhVien> findByClassName(String className);
}