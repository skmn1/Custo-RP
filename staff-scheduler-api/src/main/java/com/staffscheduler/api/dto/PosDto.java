package com.staffscheduler.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "Point of Sale location")
public class PosDto {
    @Schema(description = "PoS ID (auto-generated)", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100)
    @Schema(description = "Location name", example = "Downtown Café", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @NotBlank(message = "Address is required")
    @Schema(description = "Street address", example = "123 Main Street", requiredMode = Schema.RequiredMode.REQUIRED)
    private String address;

    @NotBlank(message = "Type is required")
    @Schema(description = "Location type", example = "restaurant", allowableValues = {"restaurant", "cafe", "bar", "food_truck", "catering"})
    private String type;

    @Schema(description = "Phone number", example = "+30-210-555-0001")
    private String phone;

    @Schema(description = "Manager employee ID", example = "emp-5")
    private String managerId;

    @Schema(description = "Manager display name (read-only)", example = "Nikolaos Stavrou", accessMode = Schema.AccessMode.READ_ONLY)
    private String managerName;

    @Schema(description = "Weekly opening hours keyed by day name")
    private Map<String, DayHours> openingHours;

    @Schema(description = "Whether the location is active", example = "true")
    private Boolean isActive;

    @Schema(description = "Creation timestamp (ISO 8601)", accessMode = Schema.AccessMode.READ_ONLY)
    private String createdAt;

    @Schema(description = "Last update timestamp (ISO 8601)", accessMode = Schema.AccessMode.READ_ONLY)
    private String updatedAt;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    @Schema(description = "Opening/closing hours for a single day")
    public static class DayHours {
        @Schema(description = "Opening time (HH:mm)", example = "09:00")
        private String open;
        @Schema(description = "Closing time (HH:mm)", example = "22:00")
        private String close;
        @Schema(description = "Whether the location is closed this day", example = "false")
        private Boolean closed;
    }
}
