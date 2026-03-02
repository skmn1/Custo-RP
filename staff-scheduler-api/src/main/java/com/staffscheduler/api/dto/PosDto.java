package com.staffscheduler.api.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PosDto {
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "Type is required")
    private String type;

    private String phone;
    private String managerId;
    private String managerName;
    private Map<String, DayHours> openingHours;
    private Boolean isActive;
    private String createdAt;
    private String updatedAt;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DayHours {
        private String open;
        private String close;
        private Boolean closed;
    }
}
