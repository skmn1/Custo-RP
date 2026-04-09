package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.UserInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserInvitationRepository extends JpaRepository<UserInvitation, UUID> {

    List<UserInvitation> findByAcceptedAtIsNullOrderByCreatedAtDesc();

    boolean existsByEmailAndAcceptedAtIsNull(String email);
}
