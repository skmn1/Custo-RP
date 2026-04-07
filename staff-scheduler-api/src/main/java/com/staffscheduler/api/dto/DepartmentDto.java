package com.staffscheduler.api.dto;

import lombok.*;

import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DepartmentDto {
    private UUID id;
    private String nameEn;
    private String nameFr;
    private String color;
    private UUID managerId;
    private Boolean active;
}
