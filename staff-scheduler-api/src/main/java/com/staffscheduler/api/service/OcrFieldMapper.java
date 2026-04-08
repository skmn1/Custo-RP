package com.staffscheduler.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.staffscheduler.api.dto.InvoiceDto;
import com.staffscheduler.api.dto.OcrImportResultDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Component
@Slf4j
public class OcrFieldMapper {

    private static final ObjectMapper mapper = new ObjectMapper();

    public OcrImportResultDto mapToResult(String ocrJson, String rawText, String provider) {
        Map<String, Double> confidence = new LinkedHashMap<>();
        InvoiceDto draft = new InvoiceDto();

        if (ocrJson == null || ocrJson.isBlank()) {
            return OcrImportResultDto.builder()
                    .draft(draft)
                    .confidence(confidence)
                    .rawText(rawText)
                    .ocrProvider(provider)
                    .build();
        }

        try {
            // Strip markdown code fences if present
            String cleaned = ocrJson.trim();
            if (cleaned.startsWith("```json")) {
                cleaned = cleaned.substring(7);
            } else if (cleaned.startsWith("```")) {
                cleaned = cleaned.substring(3);
            }
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }
            cleaned = cleaned.trim();

            JsonNode root = mapper.readTree(cleaned);

            draft.setCounterpartyName(textOrNull(root, "counterpartyName"));
            draft.setCounterpartyEmail(textOrNull(root, "counterpartyEmail"));
            draft.setCounterpartyAddress(textOrNull(root, "counterpartyAddress"));
            draft.setSupplierSiret(textOrNull(root, "supplierSiret"));
            draft.setSupplierVatNumber(textOrNull(root, "supplierVatNumber"));
            draft.setBuyerVatNumber(textOrNull(root, "buyerVatNumber"));
            draft.setIssueDate(parseDate(textOrNull(root, "issueDate")));
            draft.setDeliveryDate(parseDate(textOrNull(root, "deliveryDate")));
            draft.setDueDate(parseDate(textOrNull(root, "dueDate")));
            draft.setCurrency(textOrNull(root, "currency") != null ? textOrNull(root, "currency") : "EUR");
            draft.setTaxRate(parseBigDecimal(root, "taxRate"));
            draft.setPaymentTerms(textOrNull(root, "paymentTerms"));
            draft.setNotes(textOrNull(root, "notes"));

            // Map lines
            JsonNode linesNode = root.get("lines");
            if (linesNode != null && linesNode.isArray()) {
                List<InvoiceDto.InvoiceLineDto> lines = new ArrayList<>();
                for (JsonNode ln : linesNode) {
                    InvoiceDto.InvoiceLineDto lineDto = InvoiceDto.InvoiceLineDto.builder()
                            .description(textOrNull(ln, "description"))
                            .qty(parseBigDecimal(ln, "qty"))
                            .unitPrice(parseBigDecimal(ln, "unitPrice"))
                            .taxRate(parseBigDecimal(ln, "taxRate"))
                            .discountPct(parseBigDecimal(ln, "discountPct"))
                            .build();
                    lines.add(lineDto);
                }
                draft.setLines(lines);
            }

            // Map confidence scores
            JsonNode confNode = root.get("confidence");
            if (confNode != null && confNode.isObject()) {
                Iterator<Map.Entry<String, JsonNode>> fields = confNode.fields();
                while (fields.hasNext()) {
                    Map.Entry<String, JsonNode> entry = fields.next();
                    confidence.put(entry.getKey(), entry.getValue().asDouble(0.0));
                }
            }

        } catch (Exception e) {
            log.warn("Failed to parse OCR JSON response: {}", e.getMessage());
        }

        return OcrImportResultDto.builder()
                .draft(draft)
                .confidence(confidence)
                .rawText(rawText != null ? rawText : ocrJson)
                .ocrProvider(provider)
                .build();
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode child = node.get(field);
        if (child == null || child.isNull() || child.asText().equals("null")) return null;
        String text = child.asText().trim();
        return text.isEmpty() ? null : text;
    }

    private BigDecimal parseBigDecimal(JsonNode node, String field) {
        JsonNode child = node.get(field);
        if (child == null || child.isNull()) return null;
        try {
            if (child.isNumber()) return child.decimalValue();
            String text = child.asText().replaceAll("[^\\d.,\\-]", "").replace(",", ".");
            return text.isEmpty() ? null : new BigDecimal(text);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private LocalDate parseDate(String text) {
        if (text == null) return null;
        // Try ISO format first
        try {
            return LocalDate.parse(text, DateTimeFormatter.ISO_LOCAL_DATE);
        } catch (DateTimeParseException ignored) {}
        // Try French format dd/MM/yyyy
        try {
            return LocalDate.parse(text, DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } catch (DateTimeParseException ignored) {}
        // Try dd-MM-yyyy
        try {
            return LocalDate.parse(text, DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        } catch (DateTimeParseException ignored) {}
        return null;
    }
}
