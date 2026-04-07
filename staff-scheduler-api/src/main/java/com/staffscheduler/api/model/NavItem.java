package com.staffscheduler.api.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "nav_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NavItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "route_key", nullable = false, unique = true, length = 60)
    private String routeKey;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "visible_admin", nullable = false)
    @Builder.Default
    private Boolean visibleAdmin = true;

    @Column(name = "visible_manager", nullable = false)
    @Builder.Default
    private Boolean visibleManager = true;

    @Column(name = "visible_employee", nullable = false)
    @Builder.Default
    private Boolean visibleEmployee = true;

    @Column(name = "system_locked", nullable = false)
    @Builder.Default
    private Boolean systemLocked = false;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
