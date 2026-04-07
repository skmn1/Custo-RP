package com.staffscheduler.api.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Schema(description = "Application setting key-value pair")
public class AppSettingDto {

    @Schema(description = "Setting category", example = "business")
    private String category;

    @Schema(description = "Setting key", example = "overtimeThreshold")
    private String key;

    @Schema(description = "Setting value", example = "40")
    private String value;

    @Schema(description = "Value type (string, number, boolean, json)", example = "number")
    private String valueType;
}
