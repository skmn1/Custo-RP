package com.staffscheduler.api.dto;

import lombok.*;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PosProfileDto {
    private Long id;
    private String name;
    private String address;
    private String type;
    private String phone;
    private String managerId;
    private String managerName;
    private Map<String, Object> openingHours;
    private Boolean isActive;
    private String createdAt;
    private String updatedAt;

    // Profile fields
    private String photoUrl;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String postalCode;
    private String country;
    private String siret;
    private String vatNumber;
    private String nafCode;
    private String legalName;
    private String launchedAt;

    // Google Reviews
    private String googlePlaceId;
    private String googleMapsUrl;
    private Double googleRating;
    private Integer googleReviewCount;
    private Object googleReviewsJson;
    private String googleReviewsUpdatedAt;

    // Counts
    private Long openIncidentsCount;
}
