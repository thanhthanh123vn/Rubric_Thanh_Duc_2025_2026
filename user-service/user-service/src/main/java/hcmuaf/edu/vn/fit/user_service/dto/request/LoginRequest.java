package hcmuaf.edu.vn.fit.user_service.dto.request;


public record LoginRequest(
        String identifier, // Có thể là MSSV hoặc Email
        String password
) {}