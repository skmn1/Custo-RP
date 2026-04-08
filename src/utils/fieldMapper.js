/**
 * Client-side OCR field mapper for tesseract.js fallback.
 * Maps raw OCR text to invoice fields using regex patterns.
 */

const datePatterns = [
  /(\d{2})[/.-](\d{2})[/.-](\d{4})/,  // dd/MM/yyyy
  /(\d{4})[/.-](\d{2})[/.-](\d{2})/,  // yyyy-MM-dd
];

function extractDate(text, keywords) {
  for (const kw of keywords) {
    const idx = text.toLowerCase().indexOf(kw.toLowerCase());
    if (idx === -1) continue;
    const region = text.substring(idx, idx + 80);
    for (const pattern of datePatterns) {
      const match = region.match(pattern);
      if (match) {
        if (match[1].length === 4) return `${match[1]}-${match[2]}-${match[3]}`;
        return `${match[3]}-${match[2]}-${match[1]}`;
      }
    }
  }
  return null;
}

function extractSiret(text) {
  const match = text.match(/SIRET\s*[:\s]*(\d{14})/i);
  if (match) return match[1];
  const match2 = text.match(/(\d{3}\s?\d{3}\s?\d{3}\s?\d{5})/);
  if (match2) return match2[1].replace(/\s/g, '');
  return null;
}

function extractVatNumber(text) {
  const match = text.match(/TVA\s*(?:intra)?(?:communautaire)?\s*[:\s]*(FR\s?\d{2}\s?\d{9})/i);
  if (match) return match[1].replace(/\s/g, '');
  const match2 = text.match(/(FR\s?\d{2}\s?\d{9})/);
  if (match2) return match2[1].replace(/\s/g, '');
  return null;
}

function extractAmount(text, keywords) {
  for (const kw of keywords) {
    const idx = text.toLowerCase().indexOf(kw.toLowerCase());
    if (idx === -1) continue;
    const region = text.substring(idx, idx + 60);
    const match = region.match(/[\d\s]+[.,]\d{2}/);
    if (match) {
      return parseFloat(match[0].replace(/\s/g, '').replace(',', '.'));
    }
  }
  return null;
}

function extractSupplierName(text) {
  const lines = text.split('\n').filter(l => l.trim().length > 3);
  if (lines.length > 0) return lines[0].trim();
  return null;
}

function extractEmail(text) {
  const match = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  return match ? match[0] : null;
}

export function mapOcrTextToInvoice(rawText) {
  const confidence = {};

  const counterpartyName = extractSupplierName(rawText);
  confidence.counterpartyName = counterpartyName ? 0.4 : 0;

  const counterpartyEmail = extractEmail(rawText);
  confidence.counterpartyEmail = counterpartyEmail ? 0.7 : 0;

  const supplierSiret = extractSiret(rawText);
  confidence.supplierSiret = supplierSiret ? 0.8 : 0;

  const supplierVatNumber = extractVatNumber(rawText);
  confidence.supplierVatNumber = supplierVatNumber ? 0.8 : 0;

  const issueDate = extractDate(rawText, ['date', "date d'émission", 'émission', 'facture du', 'invoice date']);
  confidence.issueDate = issueDate ? 0.6 : 0;

  const dueDate = extractDate(rawText, ["date d'échéance", 'échéance', 'due date', 'payable avant']);
  confidence.dueDate = dueDate ? 0.6 : 0;

  const deliveryDate = extractDate(rawText, ['date de livraison', 'livraison', 'prestation', 'delivery']);
  confidence.deliveryDate = deliveryDate ? 0.5 : 0;

  const totalAmount = extractAmount(rawText, ['total ttc', 'montant total', 'net à payer', 'total']);
  confidence.totalAmount = totalAmount ? 0.5 : 0;

  return {
    draft: {
      counterpartyName,
      counterpartyEmail,
      counterpartyAddress: null,
      supplierSiret,
      supplierVatNumber,
      buyerVatNumber: null,
      issueDate,
      deliveryDate,
      dueDate,
      currency: 'EUR',
      taxRate: '20.00',
      paymentTerms: null,
      earlyPaymentDiscount: '0',
      latePaymentRate: '12.37',
      notes: null,
      lines: [],
    },
    confidence,
    rawText,
    ocrProvider: 'tesseract',
  };
}
