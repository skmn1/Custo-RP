package com.staffscheduler.api.dto;

import lombok.*;

import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NavItemDto {
    private UUID id;
    private String routeKey;
    private Integer displayOrder;
    private Boolean visibleAdmin;
    private Boolean visibleManager;
    private Boolean visibleEmployee;
    private Boolean systemLocked;
}
