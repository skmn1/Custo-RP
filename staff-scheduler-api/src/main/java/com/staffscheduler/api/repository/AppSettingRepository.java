package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.AppSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppSettingRepository extends JpaRepository<AppSetting, UUID> {

    List<AppSetting> findByCategory(String category);

    Optional<AppSetting> findByCategoryAndSettingKey(String category, String settingKey);

    void deleteByCategoryAndSettingKey(String category, String settingKey);
}
