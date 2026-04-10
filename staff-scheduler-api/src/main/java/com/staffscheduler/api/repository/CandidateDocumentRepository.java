package com.staffscheduler.api.repository;

import com.staffscheduler.api.model.CandidateDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CandidateDocumentRepository extends JpaRepository<CandidateDocument, UUID> {

    List<CandidateDocument> findByCandidateIdOrderByUploadedAtDesc(UUID candidateId);

    void deleteByCandidateId(UUID candidateId);
}
