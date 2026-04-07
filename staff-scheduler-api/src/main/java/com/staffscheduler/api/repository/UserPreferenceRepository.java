package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPreferenceRepository extends JpaRepository<UserPreference, UUID> {

    List<UserPreference> findByUserId(UUID userId);

    Optional<UserPreference> findByUserIdAndPreferenceKey(UUID userId, String preferenceKey);

    void deleteByUserIdAndPreferenceKey(UUID userId, String preferenceKey);
}
