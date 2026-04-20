package hcmuaf.edu.vn.fit.user_service.map;

import hcmuaf.edu.vn.fit.user_service.dto.request.RegisterRequest;
import hcmuaf.edu.vn.fit.user_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.user_service.entity.User;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-04-16T23:54:43+0700",
    comments = "version: 1.6.3, compiler: javac, environment: Java 23.0.1 (Oracle Corporation)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public User toUser(RegisterRequest request) {
        if ( request == null ) {
            return null;
        }

        User.UserBuilder user = User.builder();

        user.userId( request.Id() );
        user.username( request.Id() );
        user.email( request.email() );

        return user.build();
    }

    @Override
    public UserResponse toUserResponse(User user) {
        if ( user == null ) {
            return null;
        }

        String userId = null;
        String username = null;
        String email = null;
        String role = null;
        String authProvider = null;

        userId = user.getUserId();
        username = user.getUsername();
        email = user.getEmail();
        role = user.getRole();
        authProvider = user.getAuthProvider();

        UserResponse userResponse = new UserResponse( userId, username, email, role, authProvider );

        return userResponse;
    }
}
