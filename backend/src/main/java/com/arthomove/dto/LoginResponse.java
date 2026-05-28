package com.arthomove.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String token;
    private String userType;
    private String email;
    private String name;
    private Boolean mustChangePassword;
}
