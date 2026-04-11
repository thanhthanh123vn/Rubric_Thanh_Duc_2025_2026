package hcmuaf.edu.vn.fit.course_service.repository;

import hcmuaf.edu.vn.fit.course_service.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> { // Sửa Long thành String

    // 1. Lấy danh sách tin nhắn của một Lớp học phần (Hỗ trợ phân trang)
    // Sắp xếp giảm dần để lấy tin nhắn mới nhất, khi lên UI React bạn sẽ đảo ngược lại (reverse) để hiển thị từ dưới lên.
    @Query("SELECT m FROM Message m WHERE m.courseOffering.offeringId = :offeringId ORDER BY m.createdAt DESC")
    List<Message> findByOfferingId(@Param("offeringId") String offeringId, Pageable pageable);

    // 2. Đếm số lượng tin nhắn mới trong lớp kể từ lần cuối User truy cập vào lớp
    // (Thay thế cho logic SEEN/UNSEEN cũ)
    @Query("SELECT COUNT(m) FROM Message m " +
            "WHERE m.courseOffering.offeringId = :offeringId " +
            "AND m.senderId != :userId " +
            "AND m.createdAt > :lastAccessTime")
    Long countNewMessages(@Param("offeringId") String offeringId,
                          @Param("userId") String userId,
                          @Param("lastAccessTime") Timestamp lastAccessTime);

    // --- Các query tìm Pending/Unseen theo status cũ đã được LƯỢC BỎ ---
    // Vì kiến trúc Microservices và Group Chat không còn phù hợp với việc track status trực tiếp trên từng record Message.
}