package com.staffscheduler.api.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IncidentDto {
    private String id;
    private Long terminalId;

    @NotBlank @Size(max = 200)
    private String title;
    private String description;

    @NotBlank
    private String category;
    private String severity;
    private String status;

    private Long declaredBy;
    private String declaredByName;
    private String declaredAt;

    private Long assignedTo;
    private String assignedToName;
    private Long resolvedBy;
    private String resolvedByName;
    private String resolvedAt;
    private String resolutionNote;
    private String updatedAt;
}
