package hcmuaf.edu.vn.fit.user_service.repository;


import hcmuaf.edu.vn.fit.user_service.entity.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, String> {


    @Query(value = """
      select t from Token t inner join User u\s
      on t.user.userId = u.userId\s
      where u.userId = :userId and (t.expired = false or t.revoked = false)\s
      """)
    List<Token> findAllValidTokenByUser(String userId);

    Optional<Token> findByToken(String token);
}