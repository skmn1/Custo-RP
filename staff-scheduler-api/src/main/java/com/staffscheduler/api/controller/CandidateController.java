package com.staffscheduler.api.controller;

import com.staffscheduler.api.service.CandidateService;
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
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/hr/candidates")
@RequiredArgsConstructor
@Tag(name = "Candidates", description = "Candidate onboarding pipeline & account provisioning")
public class CandidateController {

    private final CandidateService candidateService;

    // ── Candidate CRUD ─────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "List all candidates, optionally filtered by status")
    public ResponseEntity<?> listCandidates(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(candidateService.listCandidates(status));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Create a new candidate and seed onboarding steps")
    public ResponseEntity<?> createCandidate(@RequestBody Map<String, Object> body,
                                              Authentication auth) {
        try {
            UUID userId = UUID.fromString(auth.getName());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(candidateService.createCandidate(body, userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", Map.of("message", e.getMessage())));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Get candidate detail including steps and documents")
    public ResponseEntity<?> getCandidate(@PathVariable UUID id) {
        return ResponseEntity.ok(candidateService.getCandidate(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Update candidate info")
    public ResponseEntity<?> updateCandidate(@PathVariable UUID id,
                                              @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(candidateService.updateCandidate(id, body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", Map.of("message", e.getMessage())));
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Advance or revert candidate status")
    public ResponseEntity<?> updateStatus(@PathVariable UUID id,
                                           @RequestBody Map<String, Object> body,
                                           Authentication auth) {
        try {
            UUID userId = UUID.fromString(auth.getName());
            return ResponseEntity.ok(candidateService.updateStatus(id, body, userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", Map.of("message", e.getMessage())));
        }
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Reject a candidate")
    public ResponseEntity<?> rejectCandidate(@PathVariable UUID id, Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(candidateService.rejectCandidate(id, userId));
    }

    @PutMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Archive a candidate")
    public ResponseEntity<?> archiveCandidate(@PathVariable UUID id) {
        return ResponseEntity.ok(candidateService.archiveCandidate(id));
    }

    // ── Onboarding Steps ───────────────────────────────────────────

    @GetMapping("/{id}/steps")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "List onboarding steps for a candidate")
    public ResponseEntity<?> listSteps(@PathVariable UUID id) {
        return ResponseEntity.ok(candidateService.getSteps(id));
    }

    @PutMapping("/{id}/steps/{stepId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Update an onboarding step (status + notes)")
    public ResponseEntity<?> updateStep(@PathVariable UUID id,
                                         @PathVariable UUID stepId,
                                         @RequestBody Map<String, Object> body,
                                         Authentication auth) {
        try {
            UUID userId = UUID.fromString(auth.getName());
            return ResponseEntity.ok(candidateService.updateStep(id, stepId, body, userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", Map.of("message", e.getMessage())));
        }
    }

    // ── Step Definitions (global) ──────────────────────────────────

    @GetMapping("/step-definitions")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "List all onboarding step definitions")
    public ResponseEntity<?> listStepDefinitions() {
        return ResponseEntity.ok(candidateService.getStepDefinitions());
    }

    // ── Documents ──────────────────────────────────────────────────

    @GetMapping("/{id}/documents")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "List documents for a candidate")
    public ResponseEntity<?> listDocuments(@PathVariable UUID id) {
        return ResponseEntity.ok(candidateService.getDocuments(id));
    }

    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Upload a document for a candidate")
    public ResponseEntity<?> uploadDocument(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "label", required = false) String label,
            Authentication auth) {
        try {
            UUID userId = UUID.fromString(auth.getName());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(candidateService.uploadDocument(id, file, documentType, label, userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", Map.of("message", e.getMessage())));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", Map.of("message", "Failed to store document")));
        }
    }

    @GetMapping("/{id}/documents/{docId}/url")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Get signed download URL for a candidate document (15-min expiry)")
    public ResponseEntity<?> getDocumentUrl(@PathVariable UUID id,
                                             @PathVariable UUID docId,
                                             HttpServletRequest request) {
        String base = request.getScheme() + "://" + request.getServerName() +
                (request.getServerPort() != 80 && request.getServerPort() != 443
                        ? ":" + request.getServerPort() : "");
        return ResponseEntity.ok(candidateService.getDocumentDownloadUrl(id, docId, base));
    }

    @GetMapping("/{id}/documents/{docId}/file")
    @Operation(summary = "Serve signed document file (no JWT — HMAC signature is the auth)")
    public ResponseEntity<?> serveDocumentFile(@PathVariable UUID id,
                                                @PathVariable UUID docId,
                                                @RequestParam long expires,
                                                @RequestParam String sig) {
        try {
            byte[] data = candidateService.serveDocumentFile(id, docId, expires, sig);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment")
                    .body(data);
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    @PutMapping("/{id}/documents/{docId}/verify")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Mark a document as verified")
    public ResponseEntity<?> verifyDocument(@PathVariable UUID id,
                                             @PathVariable UUID docId,
                                             Authentication auth) {
        UUID userId = UUID.fromString(auth.getName());
        return ResponseEntity.ok(candidateService.verifyDocument(id, docId, userId));
    }

    @DeleteMapping("/{id}/documents/{docId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Delete a candidate document")
    public ResponseEntity<?> deleteDocument(@PathVariable UUID id,
                                             @PathVariable UUID docId) {
        candidateService.deleteDocument(id, docId);
        return ResponseEntity.ok(Map.of("message", "Document deleted"));
    }

    // ── Activation ─────────────────────────────────────────────────

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Activate candidate: create employee + user + send invite email")
    public ResponseEntity<?> activate(@PathVariable UUID id, Authentication auth) {
        try {
            UUID userId = UUID.fromString(auth.getName());
            return ResponseEntity.ok(candidateService.activate(id, userId));
        } catch (CandidateService.ActivationValidationException e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("message", "Activation validation failed");
            error.put("errors", e.getErrors());
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(Map.of("error", error));
        }
    }

    @PostMapping("/{id}/resend-invite")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Re-send activation invite (new token, previous invalidated)")
    public ResponseEntity<?> resendInvite(@PathVariable UUID id, Authentication auth) {
        try {
            UUID userId = UUID.fromString(auth.getName());
            return ResponseEntity.ok(candidateService.resendInvite(id, userId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", Map.of("message", e.getMessage())));
        }
    }
}
