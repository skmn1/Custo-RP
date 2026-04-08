package com.staffscheduler.api.controller;

import com.staffscheduler.api.dto.EmployeeDocumentDto;
import com.staffscheduler.api.service.HrService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr")
@RequiredArgsConstructor
@Tag(name = "HR", description = "HR management — org chart and employee documents")
public class HrController {

    private final HrService hrService;

    // ── Org chart ──────────────────────────────────────────────────────

    @GetMapping("/org-chart")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Get org chart",
            description = "Returns the full reporting hierarchy as a nested JSON tree.")
    public ResponseEntity<List<Map<String, Object>>> orgChart() {
        return ResponseEntity.ok(hrService.buildOrgChart());
    }

    // ── Employee documents ─────────────────────────────────────────────

    @GetMapping("/employees/{employeeId}/documents")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "List documents for an employee")
    public ResponseEntity<List<EmployeeDocumentDto>> listDocuments(
            @PathVariable String employeeId) {
        return ResponseEntity.ok(hrService.listDocuments(employeeId));
    }

    @PostMapping(value = "/employees/{employeeId}/documents",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Upload a document for an employee",
            description = "Accepts only PDF, JPEG, and PNG files (validated by magic bytes). Max 10 MB.")
    public ResponseEntity<?> uploadDocument(
            @PathVariable String employeeId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            Authentication authentication) {
        try {
            UUID uploadedBy = UUID.fromString(authentication.getName());
            EmployeeDocumentDto doc = hrService.uploadDocument(employeeId, file, description, uploadedBy);
            return ResponseEntity.status(HttpStatus.CREATED).body(doc);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", Map.of("message", e.getMessage())));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", Map.of("message", "Failed to store document")));
        }
    }

    @GetMapping("/documents/{documentId}/download")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Get a signed download URL for a document",
            description = "Returns a time-limited signed URL (TTL: 15 minutes). Navigating to the URL after expiry returns 403.")
    public ResponseEntity<Map<String, String>> getDownloadUrl(
            @PathVariable UUID documentId,
            HttpServletRequest request) {
        String base = request.getScheme() + "://" + request.getServerName() +
                (request.getServerPort() != 80 && request.getServerPort() != 443
                        ? ":" + request.getServerPort() : "");
        return ResponseEntity.ok(hrService.generateDownloadUrl(documentId, base));
    }

    /**
     * Serves the actual file bytes using signed URL parameters.
     * No auth header required — the signature IS the auth — but the URL expires in 15 min.
     */
    @GetMapping("/documents/{documentId}/file")
    @Operation(summary = "Serve signed document file",
            description = "Only accessible via a valid, non-expired signed URL. Returns 403 after expiry.")
    public ResponseEntity<byte[]> serveFile(
            @PathVariable UUID documentId,
            @RequestParam long expires,
            @RequestParam String sig) {
        try {
            long now = System.currentTimeMillis() / 1000;
            byte[] data = hrService.serveFile(documentId, expires, sig, now);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment")
                    .body(data);
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @DeleteMapping("/documents/{documentId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @Operation(summary = "Delete a document", description = "Requires super_admin. hr_manager cannot delete documents.")
    public ResponseEntity<Map<String, String>> deleteDocument(@PathVariable UUID documentId) {
        hrService.deleteDocument(documentId);
        return ResponseEntity.ok(Map.of("message", "Document deleted"));
    }
}
