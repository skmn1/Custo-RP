package com.staffscheduler.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "point_of_sale")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PointOfSale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100)
    private String name;

    @NotBlank(message = "Address is required")
    @Column(nullable = false, length = 255)
    private String address;

    @NotBlank(message = "Type is required")
    @Column(nullable = false, length = 20)
    private String type;

    @Column(length = 20)
    private String phone;

    @Column(name = "manager_id", length = 50)
    private String managerId;

    @Column(name = "manager_name", length = 100)
    private String managerName;

    /** Opening hours stored as JSON text */
    @Column(name = "opening_hours", columnDefinition = "TEXT")
    private String openingHoursJson;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // ── Profile extension fields ──

    @Column(name = "photo_key", length = 500)
    private String photoKey;

    @Column(name = "address_line1", length = 200)
    private String addressLine1;

    @Column(name = "address_line2", length = 200)
    private String addressLine2;

    @Column(length = 100)
    private String city;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(length = 100)
    private String country;

    @Column(length = 14)
    private String siret;

    @Column(name = "vat_number", length = 30)
    private String vatNumber;

    @Column(name = "naf_code", length = 10)
    private String nafCode;

    @Column(name = "legal_name", length = 200)
    private String legalName;

    @Column(name = "launched_at")
    private LocalDate launchedAt;

    // ── Google Reviews fields ──

    @Column(name = "google_place_id", length = 200)
    private String googlePlaceId;

    @Column(name = "google_maps_url", length = 500)
    private String googleMapsUrl;

    @Column(name = "google_rating", columnDefinition = "NUMERIC(2,1)")
    private Double googleRating;

    @Column(name = "google_review_count")
    private Integer googleReviewCount;

    @Column(name = "google_reviews_json", columnDefinition = "TEXT")
    private String googleReviewsJson;

    @Column(name = "google_reviews_updated_at")
    private Instant googleReviewsUpdatedAt;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    private void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (country == null) country = "France";
    }

    @PreUpdate
    private void onUpdate() {
        updatedAt = Instant.now();
    }
}
