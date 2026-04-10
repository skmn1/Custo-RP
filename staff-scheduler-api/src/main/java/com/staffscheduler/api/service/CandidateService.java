package com.staffscheduler.api.service;

import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.*;
import com.staffscheduler.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CandidateService {

    private static final long MAX_FILE_BYTES = 10L * 1024 * 1024; // 10 MB
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf", "image/jpeg", "image/png"
    );
    private static final byte[] MAGIC_PDF  = new byte[]{ 0x25, 0x50, 0x44, 0x46 };
    private static final byte[] MAGIC_JPEG = new byte[]{ (byte)0xFF, (byte)0xD8, (byte)0xFF };
    private static final byte[] MAGIC_PNG  = new byte[]{ (byte)0x89, 0x50, 0x4E, 0x47 };

    private static final Set<String> VALID_STATUSES = Set.of(
            "new", "invited", "documents_pending", "under_review", "approved",
            "activated", "rejected", "archived"
    );
    private static final Set<String> VALID_CONTRACT_TYPES = Set.of(
            "cdi", "cdd", "interim", "apprenticeship", "internship"
    );
    private static final Set<String> VALID_DOC_TYPES = Set.of(
            "national_id", "passport", "work_permit", "contract_signed",
            "rib", "social_security", "other"
    );
    private static final Set<String> REQUIRED_DOC_TYPES = Set.of(
            "contract_signed", "rib", "social_security"
    );
    // national_id OR passport — at least one must be present
    private static final Set<String> IDENTITY_DOC_TYPES = Set.of("national_id", "passport");

    private static final long SIGNED_URL_TTL_SECONDS = 15 * 60;

    private final CandidateRepository candidateRepository;
    private final OnboardingStepDefinitionRepository stepDefRepository;
    private final CandidateOnboardingStepRepository stepRepository;
    private final CandidateDocumentRepository docRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final UserInvitationRepository invitationRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.documents.storage-dir:./uploads/documents}")
    private String storageDir;

    @Value("${app.documents.signing-secret:change-me-in-production}")
    private String signingSecret;

    // ── Candidates CRUD ────────────────────────────────────────────

    public List<Map<String, Object>> listCandidates(String status) {
        List<Candidate> candidates;
        if (status != null && !status.isBlank() && VALID_STATUSES.contains(status)) {
            candidates = candidateRepository.findByStatusOrderByUpdatedAtDesc(status);
        } else {
            candidates = candidateRepository.findAllByOrderByUpdatedAtDesc();
        }
        return candidates.stream().map(this::toSummary).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> createCandidate(Map<String, Object> body, UUID createdBy) {
        String email = getString(body, "email");
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required");
        }
        email = email.toLowerCase().trim();

        if (candidateRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("A candidate with this email already exists");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("A user with this email already exists");
        }
        if (employeeRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An employee with this email already exists");
        }

        String contractType = getString(body, "contractType");
        if (contractType == null || !VALID_CONTRACT_TYPES.contains(contractType)) {
            throw new IllegalArgumentException("Invalid contract type: " + contractType);
        }

        Candidate c = Candidate.builder()
                .firstName(requireString(body, "firstName"))
                .lastName(requireString(body, "lastName"))
                .email(email)
                .phone(getString(body, "phone"))
                .positionTitle(requireString(body, "positionTitle"))
                .department(getString(body, "department"))
                .contractType(contractType)
                .plannedStartDate(getDate(body, "plannedStartDate"))
                .grossSalary(getDecimal(body, "grossSalary"))
                .probationEndDate(getDate(body, "probationEndDate"))
                .notes(getString(body, "notes"))
                .createdBy(createdBy)
                .build();
        candidateRepository.save(c);

        // Seed onboarding steps
        seedOnboardingSteps(c.getId());

        log.info("Candidate {} created by {}", c.getId(), createdBy);
        return toDetail(c);
    }

    public Map<String, Object> getCandidate(UUID id) {
        Candidate c = findCandidate(id);
        Map<String, Object> detail = toDetail(c);
        detail.put("steps", getSteps(id));
        detail.put("documents", getDocuments(id));
        return detail;
    }

    @Transactional
    public Map<String, Object> updateCandidate(UUID id, Map<String, Object> body) {
        Candidate c = findCandidate(id);

        if (body.containsKey("firstName")) c.setFirstName(requireString(body, "firstName"));
        if (body.containsKey("lastName")) c.setLastName(requireString(body, "lastName"));
        if (body.containsKey("phone")) c.setPhone(getString(body, "phone"));
        if (body.containsKey("positionTitle")) c.setPositionTitle(requireString(body, "positionTitle"));
        if (body.containsKey("department")) c.setDepartment(getString(body, "department"));
        if (body.containsKey("contractType")) {
            String ct = getString(body, "contractType");
            if (!VALID_CONTRACT_TYPES.contains(ct)) {
                throw new IllegalArgumentException("Invalid contract type: " + ct);
            }
            c.setContractType(ct);
        }
        if (body.containsKey("plannedStartDate")) c.setPlannedStartDate(getDate(body, "plannedStartDate"));
        if (body.containsKey("grossSalary")) c.setGrossSalary(getDecimal(body, "grossSalary"));
        if (body.containsKey("probationEndDate")) c.setProbationEndDate(getDate(body, "probationEndDate"));
        if (body.containsKey("notes")) c.setNotes(getString(body, "notes"));

        candidateRepository.save(c);
        return toDetail(c);
    }

    @Transactional
    public Map<String, Object> updateStatus(UUID id, Map<String, Object> body, UUID reviewedBy) {
        Candidate c = findCandidate(id);
        String newStatus = requireString(body, "status");
        if (!VALID_STATUSES.contains(newStatus)) {
            throw new IllegalArgumentException("Invalid status: " + newStatus);
        }
        if ("activated".equals(newStatus)) {
            throw new IllegalArgumentException("Use the activate endpoint to activate a candidate");
        }
        c.setStatus(newStatus);
        if ("under_review".equals(newStatus) || "approved".equals(newStatus)) {
            c.setReviewedBy(reviewedBy);
        }
        candidateRepository.save(c);
        log.info("Candidate {} status updated to {} by {}", id, newStatus, reviewedBy);
        return toDetail(c);
    }

    @Transactional
    public Map<String, Object> rejectCandidate(UUID id, UUID reviewedBy) {
        Candidate c = findCandidate(id);
        c.setStatus("rejected");
        c.setReviewedBy(reviewedBy);
        candidateRepository.save(c);
        log.info("Candidate {} rejected by {}", id, reviewedBy);
        return toDetail(c);
    }

    @Transactional
    public Map<String, Object> archiveCandidate(UUID id) {
        Candidate c = findCandidate(id);
        c.setStatus("archived");
        candidateRepository.save(c);
        return toDetail(c);
    }

    // ── Onboarding steps ───────────────────────────────────────────

    public List<Map<String, Object>> getSteps(UUID candidateId) {
        return stepRepository.findByCandidateIdOrderByStepDefinitionSortOrderAsc(candidateId)
                .stream().map(this::toStepMap).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> updateStep(UUID candidateId, UUID stepId, Map<String, Object> body, UUID userId) {
        findCandidate(candidateId); // ensure candidate exists
        CandidateOnboardingStep step = stepRepository.findById(stepId)
                .filter(s -> s.getCandidateId().equals(candidateId))
                .orElseThrow(() -> new ResourceNotFoundException("Onboarding step", stepId.toString()));

        String newStatus = getString(body, "status");
        if (newStatus != null) {
            if (!Set.of("pending", "completed", "skipped", "na").contains(newStatus)) {
                throw new IllegalArgumentException("Invalid step status: " + newStatus);
            }
            step.setStatus(newStatus);
            if ("completed".equals(newStatus)) {
                step.setCompletedBy(userId);
                step.setCompletedAt(LocalDateTime.now());
            } else {
                step.setCompletedBy(null);
                step.setCompletedAt(null);
            }
        }
        if (body.containsKey("notes")) {
            step.setNotes(getString(body, "notes"));
        }
        stepRepository.save(step);
        return toStepMap(step);
    }

    public List<Map<String, Object>> getStepDefinitions() {
        return stepDefRepository.findAllByOrderBySortOrderAsc()
                .stream().map(d -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", d.getId());
                    m.put("name", d.getName());
                    m.put("description", d.getDescription());
                    m.put("isRequired", d.getIsRequired());
                    m.put("category", d.getCategory());
                    m.put("sortOrder", d.getSortOrder());
                    return m;
                }).collect(Collectors.toList());
    }

    // ── Documents ──────────────────────────────────────────────────

    public List<Map<String, Object>> getDocuments(UUID candidateId) {
        return docRepository.findByCandidateIdOrderByUploadedAtDesc(candidateId)
                .stream().map(this::toDocMap).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> uploadDocument(UUID candidateId, MultipartFile file,
                                               String documentType, String label, UUID uploadedBy) throws IOException {
        findCandidate(candidateId);

        if (documentType == null || !VALID_DOC_TYPES.contains(documentType)) {
            throw new IllegalArgumentException("Invalid document type: " + documentType);
        }
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new IllegalArgumentException("File exceeds maximum allowed size of 10 MB");
        }

        byte[] bytes = file.getBytes();
        String detectedMime = detectMimeType(bytes, file.getContentType());
        if (!ALLOWED_MIME_TYPES.contains(detectedMime)) {
            throw new IllegalArgumentException("Only PDF, JPEG, and PNG files are accepted");
        }

        String originalName = sanitiseFilename(file.getOriginalFilename());
        String storageKey = "candidate-doc-" + UUID.randomUUID();
        Path dir = Paths.get(storageDir, "candidates", candidateId.toString());
        Files.createDirectories(dir);
        Path dest = dir.resolve(storageKey);
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
        }

        CandidateDocument doc = CandidateDocument.builder()
                .candidateId(candidateId)
                .documentType(documentType)
                .label(label)
                .storageKey(storageKey)
                .originalFilename(originalName)
                .mimeType(detectedMime)
                .fileSizeBytes((int) file.getSize())
                .uploadedBy(uploadedBy)
                .build();
        docRepository.save(doc);
        log.info("Document uploaded for candidate {} type={}", candidateId, documentType);
        return toDocMap(doc);
    }

    public Map<String, String> getDocumentDownloadUrl(UUID candidateId, UUID docId, String baseUrl) {
        CandidateDocument doc = docRepository.findById(docId)
                .filter(d -> d.getCandidateId().equals(candidateId))
                .orElseThrow(() -> new ResourceNotFoundException("Document", docId.toString()));

        long expiresAt = (System.currentTimeMillis() / 1000) + SIGNED_URL_TTL_SECONDS;
        String payload = docId + ":" + expiresAt;
        String sig = hmacSha256(payload, signingSecret);

        String url = baseUrl + "/api/hr/candidates/" + candidateId + "/documents/" + docId + "/file" +
                "?expires=" + expiresAt + "&sig=" + sig;
        return Map.of(
                "url", url,
                "filename", doc.getOriginalFilename(),
                "expiresAt", String.valueOf(expiresAt)
        );
    }

    public byte[] serveDocumentFile(UUID candidateId, UUID docId, long expiresAt, String sig) {
        long now = System.currentTimeMillis() / 1000;
        if (now > expiresAt) {
            throw new AccessDeniedException("Download link has expired");
        }
        String payload = docId + ":" + expiresAt;
        String expected = hmacSha256(payload, signingSecret);
        if (!expected.equals(sig)) {
            throw new AccessDeniedException("Invalid or tampered download signature");
        }
        CandidateDocument doc = docRepository.findById(docId)
                .filter(d -> d.getCandidateId().equals(candidateId))
                .orElseThrow(() -> new ResourceNotFoundException("Document", docId.toString()));
        Path file = Paths.get(storageDir, "candidates", candidateId.toString(), doc.getStorageKey());
        try {
            return Files.readAllBytes(file);
        } catch (IOException e) {
            throw new ResourceNotFoundException("Document file", docId.toString());
        }
    }

    @Transactional
    public Map<String, Object> verifyDocument(UUID candidateId, UUID docId, UUID verifiedBy) {
        CandidateDocument doc = docRepository.findById(docId)
                .filter(d -> d.getCandidateId().equals(candidateId))
                .orElseThrow(() -> new ResourceNotFoundException("Document", docId.toString()));
        doc.setVerifiedBy(verifiedBy);
        doc.setVerifiedAt(LocalDateTime.now());
        docRepository.save(doc);
        log.info("Document {} verified by {}", docId, verifiedBy);
        return toDocMap(doc);
    }

    @Transactional
    public void deleteDocument(UUID candidateId, UUID docId) {
        CandidateDocument doc = docRepository.findById(docId)
                .filter(d -> d.getCandidateId().equals(candidateId))
                .orElseThrow(() -> new ResourceNotFoundException("Document", docId.toString()));
        Path file = Paths.get(storageDir, "candidates", candidateId.toString(), doc.getStorageKey());
        try { Files.deleteIfExists(file); } catch (IOException ignored) {}
        docRepository.delete(doc);
    }

    // ── Activation ─────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> activate(UUID candidateId, UUID activatedBy) {
        Candidate c = findCandidate(candidateId);

        // Pre-validation: required steps
        List<CandidateOnboardingStep> steps = stepRepository
                .findByCandidateIdOrderByStepDefinitionSortOrderAsc(candidateId);
        List<String> errors = new ArrayList<>();

        long requiredTotal = steps.stream()
                .filter(s -> s.getStepDefinition() != null && Boolean.TRUE.equals(s.getStepDefinition().getIsRequired()))
                .count();
        long requiredCompleted = steps.stream()
                .filter(s -> s.getStepDefinition() != null && Boolean.TRUE.equals(s.getStepDefinition().getIsRequired()))
                .filter(s -> "completed".equals(s.getStatus()))
                .count();
        if (requiredCompleted < requiredTotal) {
            errors.add("All required onboarding steps must be completed (" +
                    requiredCompleted + "/" + requiredTotal + ")");
        }

        // Pre-validation: required documents
        List<CandidateDocument> docs = docRepository.findByCandidateIdOrderByUploadedAtDesc(candidateId);
        Set<String> verifiedTypes = docs.stream()
                .filter(d -> d.getVerifiedAt() != null)
                .map(CandidateDocument::getDocumentType)
                .collect(Collectors.toSet());

        for (String reqType : REQUIRED_DOC_TYPES) {
            if (!verifiedTypes.contains(reqType)) {
                errors.add("Missing or unverified required document: " + reqType);
            }
        }
        // Identity: national_id OR passport
        boolean hasIdentity = IDENTITY_DOC_TYPES.stream().anyMatch(verifiedTypes::contains);
        if (!hasIdentity) {
            errors.add("Missing or unverified identity document (national_id or passport)");
        }

        if (!errors.isEmpty()) {
            throw new ActivationValidationException(errors);
        }

        // ── Begin transactional activation ──

        // 1. Create employee
        String employeeId = UUID.randomUUID().toString();
        Employee emp = Employee.builder()
                .id(employeeId)
                .name(c.getFullName())
                .email(c.getEmail())
                .department(c.getDepartment())
                .jobTitle(c.getPositionTitle())
                .role("employee")
                .maxHours(40)
                .status("active")
                .hireDate(c.getPlannedStartDate() != null ? c.getPlannedStartDate() : LocalDate.now())
                .hourlyRate(c.getGrossSalary() != null
                        ? c.getGrossSalary().divide(BigDecimal.valueOf(173.33), 2, java.math.RoundingMode.HALF_UP)
                        : BigDecimal.ZERO)
                .build();
        employeeRepository.save(emp);

        // 2. Create user (password_hash = placeholder, will be set via invite)
        User user = User.builder()
                .email(c.getEmail())
                .passwordHash("PENDING_INVITE")
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .role("employee")
                .isActive(true)
                .employeeId(employeeId)
                .build();
        userRepository.save(user);

        // 3. Generate invitation token
        String tokenPlaintext = UUID.randomUUID().toString();
        String tokenHash = sha256(tokenPlaintext);

        UserInvitation invitation = UserInvitation.builder()
                .email(c.getEmail())
                .role("employee")
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .tokenHash(tokenHash)
                .invitedBy(activatedBy)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        invitationRepository.save(invitation);

        // 4. Update candidate status
        c.setStatus("activated");
        c.setActivatedAt(LocalDateTime.now());
        c.setReviewedBy(activatedBy);
        candidateRepository.save(c);

        log.info("Candidate {} activated -> employee={}, user={}, invite={}",
                candidateId, employeeId, user.getId(), invitation.getId());

        // Email dispatch would happen here (non-transactional, logged only)
        log.info("Invitation email queued for {} to {}", c.getFullName(), c.getEmail());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("employeeId", employeeId);
        result.put("userId", user.getId());
        result.put("invitationId", invitation.getId());
        result.put("message", "Account activated. Invitation sent to " + c.getEmail());
        return result;
    }

    @Transactional
    public Map<String, Object> resendInvite(UUID candidateId, UUID invitedBy) {
        Candidate c = findCandidate(candidateId);
        if (!"activated".equals(c.getStatus())) {
            throw new IllegalArgumentException("Candidate must be activated before resending invite");
        }

        // Delete existing pending invitations for this email
        invitationRepository.findByAcceptedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .filter(inv -> inv.getEmail().equalsIgnoreCase(c.getEmail()))
                .forEach(invitationRepository::delete);

        // Create new invitation
        String tokenPlaintext = UUID.randomUUID().toString();
        String tokenHash = sha256(tokenPlaintext);

        UserInvitation invitation = UserInvitation.builder()
                .email(c.getEmail())
                .role("employee")
                .firstName(c.getFirstName())
                .lastName(c.getLastName())
                .tokenHash(tokenHash)
                .invitedBy(invitedBy)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        invitationRepository.save(invitation);

        log.info("Re-sent invitation for candidate {} to {}", candidateId, c.getEmail());

        return Map.of(
                "invitationId", invitation.getId().toString(),
                "message", "Invitation re-sent to " + c.getEmail()
        );
    }

    public long countByStatus(String status) {
        return candidateRepository.countByStatus(status);
    }

    // ── Helpers ────────────────────────────────────────────────────

    private void seedOnboardingSteps(UUID candidateId) {
        List<OnboardingStepDefinition> defs = stepDefRepository.findAllByOrderBySortOrderAsc();
        for (OnboardingStepDefinition def : defs) {
            CandidateOnboardingStep step = CandidateOnboardingStep.builder()
                    .candidateId(candidateId)
                    .stepDefId(def.getId())
                    .status("pending")
                    .build();
            stepRepository.save(step);
        }
    }

    private Candidate findCandidate(UUID id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidate", id.toString()));
    }

    private Map<String, Object> toSummary(Candidate c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("firstName", c.getFirstName());
        m.put("lastName", c.getLastName());
        m.put("fullName", c.getFullName());
        m.put("email", c.getEmail());
        m.put("positionTitle", c.getPositionTitle());
        m.put("department", c.getDepartment());
        m.put("contractType", c.getContractType());
        m.put("plannedStartDate", c.getPlannedStartDate());
        m.put("status", c.getStatus());
        m.put("updatedAt", c.getUpdatedAt());

        // Compute completion percentage
        List<CandidateOnboardingStep> steps = stepRepository
                .findByCandidateIdOrderByStepDefinitionSortOrderAsc(c.getId());
        long requiredTotal = steps.stream()
                .filter(s -> s.getStepDefinition() != null && Boolean.TRUE.equals(s.getStepDefinition().getIsRequired()))
                .count();
        long requiredCompleted = steps.stream()
                .filter(s -> s.getStepDefinition() != null && Boolean.TRUE.equals(s.getStepDefinition().getIsRequired()))
                .filter(s -> "completed".equals(s.getStatus()))
                .count();
        int percent = requiredTotal > 0 ? (int) (requiredCompleted * 100 / requiredTotal) : 0;
        m.put("completionPercent", percent);
        return m;
    }

    private Map<String, Object> toDetail(Candidate c) {
        Map<String, Object> m = toSummary(c);
        m.put("phone", c.getPhone());
        m.put("grossSalary", c.getGrossSalary());
        m.put("probationEndDate", c.getProbationEndDate());
        m.put("notes", c.getNotes());
        m.put("createdBy", c.getCreatedBy());
        m.put("reviewedBy", c.getReviewedBy());
        m.put("activatedAt", c.getActivatedAt());
        m.put("createdAt", c.getCreatedAt());
        return m;
    }

    private Map<String, Object> toStepMap(CandidateOnboardingStep s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", s.getId());
        m.put("candidateId", s.getCandidateId());
        m.put("stepDefId", s.getStepDefId());
        m.put("status", s.getStatus());
        m.put("completedBy", s.getCompletedBy());
        m.put("completedAt", s.getCompletedAt());
        m.put("notes", s.getNotes());
        if (s.getStepDefinition() != null) {
            m.put("name", s.getStepDefinition().getName());
            m.put("description", s.getStepDefinition().getDescription());
            m.put("isRequired", s.getStepDefinition().getIsRequired());
            m.put("category", s.getStepDefinition().getCategory());
            m.put("sortOrder", s.getStepDefinition().getSortOrder());
        }
        return m;
    }

    private Map<String, Object> toDocMap(CandidateDocument d) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", d.getId());
        m.put("candidateId", d.getCandidateId());
        m.put("documentType", d.getDocumentType());
        m.put("label", d.getLabel());
        m.put("originalFilename", d.getOriginalFilename());
        m.put("mimeType", d.getMimeType());
        m.put("fileSizeBytes", d.getFileSizeBytes());
        m.put("uploadedBy", d.getUploadedBy());
        m.put("uploadedAt", d.getUploadedAt());
        m.put("verifiedBy", d.getVerifiedBy());
        m.put("verifiedAt", d.getVerifiedAt());
        // storage_key intentionally omitted from response
        return m;
    }

    private String detectMimeType(byte[] bytes, String contentTypeHeader) {
        if (bytes.length >= 4) {
            if (startsWith(bytes, MAGIC_PDF))  return "application/pdf";
            if (startsWith(bytes, MAGIC_JPEG)) return "image/jpeg";
            if (startsWith(bytes, MAGIC_PNG))  return "image/png";
        }
        if (contentTypeHeader != null && ALLOWED_MIME_TYPES.contains(contentTypeHeader)) {
            return contentTypeHeader;
        }
        return contentTypeHeader != null ? contentTypeHeader : "application/octet-stream";
    }

    private boolean startsWith(byte[] data, byte[] prefix) {
        if (data.length < prefix.length) return false;
        for (int i = 0; i < prefix.length; i++) {
            if (data[i] != prefix[i]) return false;
        }
        return true;
    }

    private String sanitiseFilename(String filename) {
        if (filename == null || filename.isBlank()) return "document";
        String cleaned = filename.replaceAll("[/\\\\:*?\"<>|\0]", "_").trim();
        return cleaned.length() > 200 ? cleaned.substring(0, 200) : cleaned;
    }

    private String hmacSha256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] raw = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(raw);
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute HMAC", e);
        }
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute SHA-256", e);
        }
    }

    private String getString(Map<String, Object> body, String key) {
        Object v = body.get(key);
        return v != null ? v.toString().trim() : null;
    }

    private String requireString(Map<String, Object> body, String key) {
        String v = getString(body, key);
        if (v == null || v.isBlank()) {
            throw new IllegalArgumentException(key + " is required");
        }
        return v;
    }

    private LocalDate getDate(Map<String, Object> body, String key) {
        Object v = body.get(key);
        if (v == null) return null;
        if (v instanceof LocalDate) return (LocalDate) v;
        return LocalDate.parse(v.toString());
    }

    private BigDecimal getDecimal(Map<String, Object> body, String key) {
        Object v = body.get(key);
        if (v == null) return null;
        if (v instanceof BigDecimal) return (BigDecimal) v;
        if (v instanceof Number) return BigDecimal.valueOf(((Number) v).doubleValue());
        return new BigDecimal(v.toString());
    }

    // ── Custom exception for activation validation ─────────────────

    public static class ActivationValidationException extends RuntimeException {
        private final List<String> errors;

        public ActivationValidationException(List<String> errors) {
            super("Activation validation failed: " + String.join("; ", errors));
            this.errors = errors;
        }

        public List<String> getErrors() { return errors; }
    }
}
