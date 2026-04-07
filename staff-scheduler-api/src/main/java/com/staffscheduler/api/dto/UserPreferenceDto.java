package com.staffscheduler.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "User preference key-value pair")
public class UserPreferenceDto {

    @Schema(description = "Preference key", example = "theme")
    private String key;

    @Schema(description = "Preference value", example = "dark")
    private String value;
}
