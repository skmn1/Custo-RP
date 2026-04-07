package com.staffscheduler.api.dto;

import lombok.*;

import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private UserDto user;
    private String accessToken;
    private String refreshToken;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UserDto {
        private UUID id;
        private String email;
        private String firstName;
        private String lastName;
        private String role;
        private Boolean isActive;
    }
}
