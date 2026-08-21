package hcmuaf.edu.vn.fit.user_service.repository;

import hcmuaf.edu.vn.fit.user_service.entity.LoginHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoginHistoryRepository
        extends JpaRepository<LoginHistory, Long> {

    Optional<LoginHistory> findTopByUserIdAndStatusOrderByLoginAtDesc(
            String userId,
            String status
    );

    List<LoginHistory> findTop10ByUserIdOrderByLoginAtDesc(
            String userId
    );
}