package hcmuaf.edu.vn.fit.user_service.repository;



import hcmuaf.edu.vn.fit.user_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);


    Optional<User> findByGoogleId(String googleId);

    Optional<User> findByEmail(String email);
}