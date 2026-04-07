package com.staffscheduler.api.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SupplierDto {
    private UUID id;
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private String currency;
    private String paymentTerms;
    private Integer leadTimeDays;
    private Boolean isActive;
    private String notes;
}
