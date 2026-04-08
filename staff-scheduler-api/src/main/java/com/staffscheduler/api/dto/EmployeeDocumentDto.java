package com.staffscheduler.api.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmployeeDocumentDto {
    private UUID id;
    private String employeeId;
    private String employeeName;
    private String originalFilename;
    private String mimeType;
    private Long fileSizeBytes;
    private UUID uploadedBy;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
    private String description;
}
