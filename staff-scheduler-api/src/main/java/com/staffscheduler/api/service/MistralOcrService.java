package com.staffscheduler.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;

@Service
@Slf4j
public class MistralOcrService {

    @Value("${mistral.api.key:#{null}}")
    private String apiKey;

    @Value("${mistral.api.url:https://api.mistral.ai/v1/chat/completions}")
    private String apiUrl;

    private static final String MODEL = "mistral-ocr-latest";
    private static final ObjectMapper mapper = new ObjectMapper();

    private static final String EXTRACTION_PROMPT = """
            Analyse cette facture fournisseur et extrais les informations suivantes au format JSON strict.
            Retourne UNIQUEMENT un objet JSON valide, sans texte avant ou après.
            
            {
              "counterpartyName": "nom du fournisseur",
              "counterpartyEmail": "email du fournisseur",
              "counterpartyAddress": "adresse complète du fournisseur",
              "supplierSiret": "SIRET 14 chiffres",
              "supplierVatNumber": "numéro TVA intracommunautaire (format FR...)",
              "buyerVatNumber": "numéro TVA acheteur si visible",
              "issueDate": "date d'émission YYYY-MM-DD",
              "deliveryDate": "date de livraison YYYY-MM-DD",
              "dueDate": "date d'échéance YYYY-MM-DD",
              "currency": "devise (EUR par défaut)",
              "taxRate": "taux TVA principal en nombre (ex: 20.00)",
              "paymentTerms": "conditions de paiement",
              "invoiceNumber": "numéro de facture du fournisseur",
              "notes": "mentions obligatoires ou notes",
              "lines": [
                {
                  "description": "désignation de la ligne",
                  "qty": "quantité en nombre",
                  "unitPrice": "prix unitaire HT en nombre",
                  "taxRate": "taux TVA de la ligne en nombre",
                  "discountPct": "remise en pourcentage"
                }
              ],
              "confidence": {
                "counterpartyName": 0.95,
                "supplierSiret": 0.90,
                "issueDate": 0.85,
                "lines": 0.80
              }
            }
            
            Pour chaque champ, indique un score de confiance entre 0 et 1 dans l'objet "confidence".
            Si un champ n'est pas trouvé, mets null et confiance 0.
            """;

    public String extractFromPdf(byte[] pdfBytes) throws IOException, InterruptedException {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Mistral API key not configured – returning empty OCR result");
            return null;
        }

        String base64Pdf = Base64.getEncoder().encodeToString(pdfBytes);

        ObjectNode requestBody = mapper.createObjectNode();
        requestBody.put("model", MODEL);

        ArrayNode messages = requestBody.putArray("messages");
        ObjectNode userMessage = messages.addObject();
        userMessage.put("role", "user");

        ArrayNode content = userMessage.putArray("content");

        // Add the image/document content
        ObjectNode imageContent = content.addObject();
        imageContent.put("type", "image_url");
        ObjectNode imageUrl = imageContent.putObject("image_url");
        imageUrl.put("url", "data:application/pdf;base64," + base64Pdf);

        // Add the text prompt
        ObjectNode textContent = content.addObject();
        textContent.put("type", "text");
        textContent.put("text", EXTRACTION_PROMPT);

        requestBody.put("max_tokens", 4096);

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(requestBody)))
                .timeout(Duration.ofSeconds(60))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("Mistral OCR API returned status {}: {}", response.statusCode(), response.body());
            throw new IOException("Mistral API error: " + response.statusCode());
        }

        JsonNode responseJson = mapper.readTree(response.body());
        JsonNode choices = responseJson.get("choices");
        if (choices != null && choices.isArray() && !choices.isEmpty()) {
            return choices.get(0).get("message").get("content").asText();
        }

        return null;
    }
}
