package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.AppPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppPermissionRepository extends JpaRepository<AppPermission, AppPermission.AppPermissionId> {

    List<AppPermission> findByRole(String role);

    List<AppPermission> findByAppId(String appId);

    List<AppPermission> findByRoleAndPermissionLevelNot(String role, String excludedLevel);
}
