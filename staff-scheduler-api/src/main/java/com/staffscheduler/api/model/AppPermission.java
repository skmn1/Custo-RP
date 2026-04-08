package com.staffscheduler.api.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "app_permissions")
@IdClass(AppPermission.AppPermissionId.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AppPermission {

    @Id
    @Column(name = "app_id", length = 30)
    private String appId;

    @Id
    @Column(name = "role", length = 30)
    private String role;

    @NotBlank
    @Column(name = "permission_level", nullable = false, length = 20)
    private String permissionLevel;  // "full", "read", "none"

    // ── Composite PK class ──
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
    public static class AppPermissionId implements Serializable {
        private String appId;
        private String role;
    }
}
