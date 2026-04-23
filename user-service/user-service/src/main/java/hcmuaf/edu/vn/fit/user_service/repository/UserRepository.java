package hcmuaf.edu.vn.fit.user_service.repository;


import hcmuaf.edu.vn.fit.user_service.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import hcmuaf.edu.vn.fit.user_service.entity.enums.Role;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    Optional<User> findByEmail(String email);

    Page<User> findByRole(String role,  Pageable pageable);
    Page<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String username, String email, Pageable pageable);




    @Query("SELECT u FROM User u WHERE u.role = :role AND (LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<User> findByRoleAndKeyword(@Param("role") String role, @Param("keyword") String keyword, Pageable pageable);
}