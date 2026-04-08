package com.staffscheduler.api.service;

import com.staffscheduler.api.dto.EmployeeDocumentDto;
import com.staffscheduler.api.exception.ResourceNotFoundException;
import com.staffscheduler.api.model.Employee;
import com.staffscheduler.api.model.EmployeeDocument;
import com.staffscheduler.api.model.User;
import com.staffscheduler.api.repository.EmployeeDocumentRepository;
import com.staffscheduler.api.repository.EmployeeRepository;
import com.staffscheduler.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HrService {

    private static final long MAX_FILE_BYTES = 10L * 1024 * 1024; // 10 MB
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf", "image/jpeg", "image/png"
    );
    // Magic byte signatures
    private static final byte[] MAGIC_PDF  = new byte[]{ 0x25, 0x50, 0x44, 0x46 }; // %PDF
    private static final byte[] MAGIC_JPEG = new byte[]{ (byte)0xFF, (byte)0xD8, (byte)0xFF };
    private static final byte[] MAGIC_PNG  = new byte[]{ (byte)0x89, 0x50, 0x4E, 0x47 };

    // Signed URL expiry in seconds (15 minutes)
    private static final long SIGNED_URL_TTL_SECONDS = 15 * 60;

    private final EmployeeRepository employeeRepository;
    private final EmployeeDocumentRepository documentRepository;
    private final UserRepository userRepository;

    @Value("${app.documents.storage-dir:./uploads/documents}")
    private String storageDir;

    @Value("${app.documents.signing-secret:change-me-in-production}")
    private String signingSecret;

    // ── Org chart ──────────────────────────────────────────────────────

    public List<Map<String, Object>> buildOrgChart() {
        List<Employee> all = employeeRepository.findAll();
        Map<String, Employee> byId = all.stream()
                .collect(Collectors.toMap(Employee::getId, e -> e));
        // Build tree; roots have null reportsToId
        Map<String, List<Map<String, Object>>> childrenMap = new HashMap<>();
        List<Map<String, Object>> roots = new ArrayList<>();

        for (Employee emp : all) {
            Map<String, Object> node = toNode(emp);
            String parentId = emp.getReportsToId();
            if (parentId == null) {
                roots.add(node);
            } else {
                childrenMap.computeIfAbsent(parentId, k -> new ArrayList<>()).add(node);
            }
        }

        // Attach children recursively
        attachChildren(roots, childrenMap);
        return roots;
    }

    private void attachChildren(List<Map<String, Object>> nodes,
                                Map<String, List<Map<String, Object>>> childrenMap) {
        for (Map<String, Object> node : nodes) {
            String id = (String) node.get("id");
            List<Map<String, Object>> children = childrenMap.getOrDefault(id, List.of());
            node.put("children", children);
            attachChildren(children, childrenMap);
        }
    }

    private Map<String, Object> toNode(Employee e) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", e.getId());
        m.put("name", e.getName());
        m.put("role", e.getRole());
        m.put("jobTitle", e.getJobTitle() != null ? e.getJobTitle() : e.getRole());
        m.put("department", e.getDepartment());
        m.put("avatar", e.getAvatar());
        m.put("color", e.getColor());
        m.put("reportsToId", e.getReportsToId());
        m.put("isManager", Boolean.TRUE.equals(e.getIsManager()));
        m.put("children", new ArrayList<>());
        return m;
    }

    // ── Documents ──────────────────────────────────────────────────────

    public List<EmployeeDocumentDto> listDocuments(String employeeId) {
        return documentRepository.findByEmployeeIdOrderByUploadedAtDesc(employeeId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public EmployeeDocumentDto uploadDocument(
            String employeeId, MultipartFile file, String description, UUID uploadedBy) throws IOException {

        // 1. Employee must exist
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", employeeId));

        // 2. Size check
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new IllegalArgumentException(
                    "File exceeds maximum allowed size of 10 MB (got " +
                    file.getSize() / (1024 * 1024) + " MB)");
        }

        // 3. MIME type validation via magic bytes (NOT extension)
        byte[] header = file.getBytes();
        String detectedMime = detectMimeType(header, file.getContentType());
        if (!ALLOWED_MIME_TYPES.contains(detectedMime)) {
            throw new IllegalArgumentException(
                    "File type not allowed. Only PDF, JPEG, and PNG are accepted. " +
                    "Detected type: " + detectedMime);
        }

        // 4. Sanitise filename – strip path separators, keep extension only for display
        String originalName = sanitiseFilename(file.getOriginalFilename());

        // 5. Store under UUID-based storage key
        String storageKey = "doc-" + UUID.randomUUID() + "-" + UUID.randomUUID();
        Path dir = Paths.get(storageDir, employeeId);
        Files.createDirectories(dir);
        Path dest = dir.resolve(storageKey);
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
        }

        // 6. Persist record
        EmployeeDocument doc = EmployeeDocument.builder()
                .employeeId(employeeId)
                .originalFilename(originalName)
                .storageKey(storageKey)
                .mimeType(detectedMime)
                .fileSizeBytes(file.getSize())
                .uploadedBy(uploadedBy)
                .description(description)
                .build();
        documentRepository.save(doc);
        return toDto(doc);
    }

    public Map<String, String> generateDownloadUrl(UUID documentId, String baseUrl) {
        EmployeeDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId.toString()));

        long expiresAt = (System.currentTimeMillis() / 1000) + SIGNED_URL_TTL_SECONDS;
        String payload = documentId + ":" + expiresAt;
        String sig = hmacSha256(payload, signingSecret);

        String url = baseUrl + "/api/hr/documents/" + documentId + "/file" +
                "?expires=" + expiresAt + "&sig=" + sig;
        return Map.of(
                "url", url,
                "filename", doc.getOriginalFilename(),
                "expiresAt", String.valueOf(expiresAt)
        );
    }

    public byte[] serveFile(UUID documentId, long expiresAt, String sig, long nowSeconds) {
        // Verify expiry
        if (nowSeconds > expiresAt) {
            throw new AccessDeniedException("Download link has expired");
        }
        // Verify signature
        String payload = documentId + ":" + expiresAt;
        String expected = hmacSha256(payload, signingSecret);
        if (!expected.equals(sig)) {
            throw new AccessDeniedException("Invalid or tampered download signature");
        }
        EmployeeDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId.toString()));
        Path file = Paths.get(storageDir, doc.getEmployeeId(), doc.getStorageKey());
        try {
            return Files.readAllBytes(file);
        } catch (IOException e) {
            throw new ResourceNotFoundException("Document file", documentId.toString());
        }
    }

    @Transactional
    public void deleteDocument(UUID documentId) {
        EmployeeDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document", documentId.toString()));
        Path file = Paths.get(storageDir, doc.getEmployeeId(), doc.getStorageKey());
        try { Files.deleteIfExists(file); } catch (IOException ignored) {}
        documentRepository.delete(doc);
    }

    // ── Helpers ────────────────────────────────────────────────────────

    private String detectMimeType(byte[] bytes, String contentTypeHeader) {
        if (bytes.length >= 4) {
            if (startsWith(bytes, MAGIC_PDF))  return "application/pdf";
            if (startsWith(bytes, MAGIC_JPEG)) return "image/jpeg";
            if (startsWith(bytes, MAGIC_PNG))  return "image/png";
        }
        // Fall back to declared content type if magic bytes unrecognised
        // but only if it is already in the allowed set (never trust extension alone)
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
        // Strip path separators and null bytes
        String cleaned = filename.replaceAll("[/\\\\:*?\"<>|\0]", "_").trim();
        // Limit length
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

    private EmployeeDocumentDto toDto(EmployeeDocument d) {
        String uploaderName = null;
        if (d.getUploadedBy() != null) {
            uploaderName = userRepository.findById(d.getUploadedBy())
                    .map(u -> u.getFirstName() + " " + u.getLastName())
                    .orElse(null);
        }
        String empName = employeeRepository.findById(d.getEmployeeId())
                .map(Employee::getName).orElse(null);
        return EmployeeDocumentDto.builder()
                .id(d.getId())
                .employeeId(d.getEmployeeId())
                .employeeName(empName)
                .originalFilename(d.getOriginalFilename())
                .mimeType(d.getMimeType())
                .fileSizeBytes(d.getFileSizeBytes())
                .uploadedBy(d.getUploadedBy())
                .uploadedByName(uploaderName)
                .uploadedAt(d.getUploadedAt())
                .description(d.getDescription())
                .build();
    }
}
