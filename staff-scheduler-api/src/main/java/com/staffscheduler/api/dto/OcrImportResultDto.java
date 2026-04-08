package com.staffscheduler.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OcrImportResultDto {
    private InvoiceDto draft;
    private Map<String, Double> confidence;
    private String rawText;
    private String ocrProvider;
}
