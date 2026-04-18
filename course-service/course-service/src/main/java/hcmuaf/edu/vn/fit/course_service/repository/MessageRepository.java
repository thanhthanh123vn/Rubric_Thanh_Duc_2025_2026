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
public interface MessageRepository extends JpaRepository<Message, String> {

    // 1. Lấy danh sách tin nhắn của một Lớp học phần (Hỗ trợ phân trang)

    @Query("SELECT m FROM Message m WHERE m.courseOffering.offeringId = :offeringId ORDER BY m.createdAt DESC")
    List<Message> findByOfferingId(@Param("offeringId") String offeringId, Pageable pageable);

    // 2. Đếm số lượng tin nhắn mới trong lớp kể từ lần cuối User truy cập vào lớp

    @Query("SELECT COUNT(m) FROM Message m " +
            "WHERE m.courseOffering.offeringId = :offeringId " +
            "AND m.senderId != :userId " +
            "AND m.createdAt > :lastAccessTime")
    Long countNewMessages(@Param("offeringId") String offeringId,
                          @Param("userId") String userId,
                          @Param("lastAccessTime") Timestamp lastAccessTime);

    List<Message> findByCourseOffering_OfferingIdOrderByCreatedAtAsc(String offeringId);
    List<Message> findByConversation_IdOrderByCreatedAtAsc(String conversationId);
}
