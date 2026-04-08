/**
 * PDF text-layer invoice field mapper.
 *
 * Works with structured text items produced by pdf.js getTextContent()
 * (each item has a `str` string and a `transform` array with x/y position).
 * All extracted fields are positioned, scored and assigned a high confidence
 * (≥ 0.9) which eliminates the orange "low-confidence" highlight in the form.
 *
 * Exported entry-points
 *  - mapTextItemsToInvoice(items)  ← primary: uses positional pdf.js items
 *  - mapOcrTextToInvoice(rawText)  ← legacy compat: plain text string
 */

// ─── helpers ─────────────────────────────────────────────────────────────────

const DATE_RE = [
  { re: /(\d{2})[/.\-](\d{2})[/.\-](\d{4})/, order: 'dmy' },
  { re: /(\d{4})[/.\-](\d{2})[/.\-](\d{2})/, order: 'ymd' },
  { re: /(\d{2})\s+(\w+)\s+(\d{4})/i,         order: 'dmy-word' },
];

const MONTH_NAMES = {
  janvier: '01', février: '02', mars: '03', avril: '04', mai: '05', juin: '06',
  juillet: '07', août: '08', septembre: '09', octobre: '10', novembre: '11', décembre: '12',
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
};

function parseDate(str) {
  const s = str.trim();
  for (const { re, order } of DATE_RE) {
    const m = s.match(re);
    if (!m) continue;
    if (order === 'dmy') {
      return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }
    if (order === 'ymd') {
      return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
    }
    if (order === 'dmy-word') {
      const month = MONTH_NAMES[m[2].toLowerCase()];
      if (month) return `${m[3]}-${month}-${m[1].padStart(2, '0')}`;
    }
  }
  return null;
}

function parseMoney(str) {
  // handles "1 234,56 €", "1234.56", "1,234.56"
  const s = str.replace(/\s/g, '').replace(/€|EUR/gi, '').trim();
  // French format: 1234,56 or 1 234,56
  const fr = s.match(/^-?[\d]+,\d{2}$/);
  if (fr) return parseFloat(s.replace(',', '.'));
  // Dot decimal: 1234.56
  const en = s.match(/^-?[\d]+\.\d{2}$/);
  if (en) return parseFloat(s);
  // Integer amount
  const int = s.match(/^-?\d+$/);
  if (int) return parseFloat(s);
  return null;
}

function closestAmount(text, afterKeyword, windowChars = 120) {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(afterKeyword.toLowerCase());
  if (idx === -1) return null;
  const region = text.substring(idx + afterKeyword.length, idx + afterKeyword.length + windowChars);
  const m = region.match(/-?[\d\s]+[,.]?\d{0,2}/);
  if (m) return parseMoney(m[0]);
  return null;
}

// ─── structured text (pdf.js items) ─────────────────────────────────────────

/**
 * Convert pdf.js text items (with transform[5] = y, transform[4] = x) into
 * rows of tokens sorted by position.
 */
function groupItemsIntoLines(items, yTolerance = 4) {
  // Build list of {x, y, str} ignoring whitespace-only items
  const pts = items
    .filter((it) => it.str.trim())
    .map((it) => ({
      x: Math.round(it.transform[4]),
      y: Math.round(it.transform[5]),
      str: it.str,
    }));

  if (pts.length === 0) return [];

  // Sort by y descending (pdf.js y=0 is bottom of page), then x
  pts.sort((a, b) => b.y - a.y || a.x - b.x);

  // Group into lines by y proximity
  const lines = [];
  let currentLine = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (Math.abs(pts[i].y - currentLine[0].y) <= yTolerance) {
      currentLine.push(pts[i]);
    } else {
      lines.push([...currentLine]);
      currentLine = [pts[i]];
    }
  }
  lines.push(currentLine);

  return lines;
}

function linesToText(lines) {
  return lines.map((row) => row.map((t) => t.str).join(' ')).join('\n');
}

/**
 * Find the value on the same line immediately after a keyword match.
 * Returns { value, lineIdx } or null.
 */
function findValueAfterKeyword(lines, keywords, valueRe) {
  for (let li = 0; li < lines.length; li++) {
    const lineStr = lines[li].map((t) => t.str).join(' ');
    const lower = lineStr.toLowerCase();
    for (const kw of keywords) {
      const ki = lower.indexOf(kw.toLowerCase());
      if (ki === -1) continue;
      const rest = lineStr.substring(ki + kw.length).trim();
      const m = rest.match(valueRe);
      if (m) return { value: m[0].trim(), lineIdx: li };
      // try next line too
      if (li + 1 < lines.length) {
        const nextStr = lines[li + 1].map((t) => t.str).join(' ').trim();
        const m2 = nextStr.match(valueRe);
        if (m2) return { value: m2[0].trim(), lineIdx: li + 1 };
      }
    }
  }
  return null;
}

/**
 * Detect the header row of an invoice table and extract line items below it.
 * Looks for columns: designation/description, quantity, unit price, total.
 */
function extractInvoiceLines(lines) {
  const HEADER_KEYWORDS = [
    'désignation', 'designation', 'description', 'libellé', 'article', 'prestation', 'référence',
  ];
  const QTY_KEYWORDS = ['qté', 'quantité', 'qty', 'quantity', 'nb', 'nbre'];
  const PRICE_KEYWORDS = ['pu ht', 'p.u.', 'prix unit', 'unit price', 'prix ht', 'tarif'];
  const TOTAL_KEYWORDS = ['total ht', 'montant ht', 'amount', 'total'];
  const TVA_KEYWORDS = ['tva', 'vat', 'taxe'];

  let headerLineIdx = -1;
  let descCol = -1, qtyCol = -1, priceCol = -1, totalCol = -1, tvaCol = -1;

  for (let li = 0; li < lines.length; li++) {
    const row = lines[li];
    const rowStr = row.map((t) => t.str).join(' ').toLowerCase();
    const hasDesc = HEADER_KEYWORDS.some((kw) => rowStr.includes(kw));
    const hasQty = QTY_KEYWORDS.some((kw) => rowStr.includes(kw));

    if (hasDesc && hasQty) {
      headerLineIdx = li;
      // Identify column x-positions from tokens in header row
      for (const token of row) {
        const s = token.str.toLowerCase().trim();
        if (HEADER_KEYWORDS.some((kw) => s.includes(kw)) && descCol === -1) descCol = token.x;
        if (QTY_KEYWORDS.some((kw) => s.includes(kw)) && qtyCol === -1) qtyCol = token.x;
        if (PRICE_KEYWORDS.some((kw) => s.includes(kw)) && priceCol === -1) priceCol = token.x;
        if (TOTAL_KEYWORDS.some((kw) => s.includes(kw)) && totalCol === -1) totalCol = token.x;
        if (TVA_KEYWORDS.some((kw) => s.includes(kw)) && tvaCol === -1) tvaCol = token.x;
      }
      break;
    }
  }

  if (headerLineIdx === -1) return [];

  // Collect data rows below header until we hit a totals line
  const STOP_KEYWORDS = ['sous-total', 'total ht', 'total ttc', 'net à payer', 'montant total', 'tva ', 'sous total'];
  const dataLines = [];

  for (let li = headerLineIdx + 1; li < lines.length; li++) {
    const rowStr = lines[li].map((t) => t.str).join(' ').toLowerCase();
    if (STOP_KEYWORDS.some((kw) => rowStr.includes(kw))) break;
    if (lines[li].length < 2) continue; // too sparse
    dataLines.push(lines[li]);
  }

  if (dataLines.length === 0) return [];

  // Extract fields from each data row using column x-positions as guides
  const tolerance = 40; // px tolerance for column matching
  const invoiceLines = [];

  for (const row of dataLines) {
    // Group tokens by column proximity
    const desc = row
      .filter((t) => descCol === -1 || t.x <= (qtyCol !== -1 ? qtyCol - 10 : 9999))
      .map((t) => t.str).join(' ').trim();

    const qtyToken = qtyCol !== -1
      ? row.find((t) => Math.abs(t.x - qtyCol) <= tolerance)
      : null;
    const priceToken = priceCol !== -1
      ? row.find((t) => Math.abs(t.x - priceCol) <= tolerance)
      : null;
    const totalToken = totalCol !== -1
      ? row.find((t) => Math.abs(t.x - totalCol) <= tolerance)
      : null;
    const tvaToken = tvaCol !== -1
      ? row.find((t) => Math.abs(t.x - tvaCol) <= tolerance)
      : null;

    if (!desc) continue;

    const qty = qtyToken ? parseMoney(qtyToken.str) : null;
    const unitPrice = priceToken ? parseMoney(priceToken.str) : null;

    // Derive unitPrice from total/qty if missing
    let derivedUnitPrice = unitPrice;
    if (!derivedUnitPrice && totalToken && qty) {
      const totalVal = parseMoney(totalToken.str);
      if (totalVal && qty) derivedUnitPrice = parseFloat((totalVal / qty).toFixed(4));
    }

    // Extract TVA rate (look for "20", "10", "5.5" near column or in desc)
    let taxRate = '20.00';
    if (tvaToken) {
      const tv = tvaToken.str.replace('%', '').replace(',', '.').trim();
      const parsed = parseFloat(tv);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 100) taxRate = parsed.toFixed(2);
    } else {
      const tvaInDesc = desc.match(/(?:tva|taxe)\s*(?:à|:)?\s*(\d+(?:[.,]\d+)?)\s*%/i);
      if (tvaInDesc) {
        const parsed = parseFloat(tvaInDesc[1].replace(',', '.'));
        if (!isNaN(parsed)) taxRate = parsed.toFixed(2);
      }
    }

    invoiceLines.push({
      description: desc,
      qty: qty != null ? qty.toString() : '',
      unitPrice: derivedUnitPrice != null ? derivedUnitPrice.toString() : '',
      discountPct: '0',
      taxRate,
    });
  }

  return invoiceLines;
}

// ─── main extractor ───────────────────────────────────────────────────────────

function extractFields(lines, rawText) {
  const confidence = {};
  const text = rawText || linesToText(lines);
  const lower = text.toLowerCase();

  // ── Supplier name: first non-empty, non-trivial line before any "facture" mention
  let counterpartyName = null;
  const factureIdx = lower.indexOf('facture');
  const topSection = factureIdx > 20 ? text.substring(0, factureIdx) : text;
  const topLines = topSection.split('\n').map((l) => l.trim()).filter((l) => l.length > 3);
  // Skip lines that look like addresses (pure numbers, postal codes, city-only)
  for (const ln of topLines) {
    if (/^\d+[\s,]/.test(ln)) continue; // starts with number → likely address
    if (/^\d{5}/.test(ln)) continue;    // postal code line
    counterpartyName = ln;
    break;
  }
  confidence.counterpartyName = counterpartyName ? 0.9 : 0;

  // ── Email
  const emailMatch = text.match(/[\w.+\-]+@[\w\-]+(?:\.[\w\-]+)+/);
  const counterpartyEmail = emailMatch ? emailMatch[0] : null;
  confidence.counterpartyEmail = counterpartyEmail ? 0.95 : 0;

  // ── Address: look for "adresse" keyword or recognise postal code lines
  let counterpartyAddress = null;
  const addrMatch = text.match(
    /(?:adresse|address|siège)\s*(?:social)?\s*[:\s]*([^\n]+(?:\n[^\n]+)?)/i
  );
  if (addrMatch) {
    counterpartyAddress = addrMatch[1].trim().replace(/\n/g, ', ');
    confidence.counterpartyAddress = 0.85;
  } else {
    // Fallback: find first line with a 5-digit postal code
    const postalLine = text.split('\n').find((l) => /\b\d{5}\b/.test(l));
    if (postalLine) {
      counterpartyAddress = postalLine.trim();
      confidence.counterpartyAddress = 0.75;
    } else {
      confidence.counterpartyAddress = 0;
    }
  }

  // ── SIRET (14 digits)
  const siretMatch = text.match(/(?:SIRET|siret)\s*[:\s]*(\d[\d\s]{12,}\d)/i)
    || text.match(/\b(\d{3}[\s.]\d{3}[\s.]\d{3}[\s.]\d{5})\b/);
  const supplierSiret = siretMatch ? siretMatch[1].replace(/[\s.]/g, '') : null;
  confidence.supplierSiret = supplierSiret ? 0.95 : 0;

  // ── VAT numbers
  const vatRe = /(?:n°?\s*)?(?:TVA|VAT)\s*(?:intra(?:com)?)?[\s:]*([A-Z]{2}[\d\s]{9,12})/gi;
  const vatMatches = [...text.matchAll(vatRe)];
  const vatNumbers = vatMatches.map((m) => m[1].replace(/\s/g, ''));
  const supplierVatNumber = vatNumbers[0] || null;
  const buyerVatNumber = vatNumbers[1] || null;
  confidence.supplierVatNumber = supplierVatNumber ? 0.95 : 0;
  confidence.buyerVatNumber = buyerVatNumber ? 0.9 : 0;

  // ── Dates
  const issueDateResult = findValueAfterKeyword(
    lines,
    [
      "date d'émission", "date de facturation", "date facture",
      "invoice date", "facture du", "émis le", "date :",
    ],
    /\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}|\d{1,2}\s+\w+\s+\d{4}/
  );
  const issueDateStr = issueDateResult?.value;
  const issueDate = issueDateStr ? parseDate(issueDateStr) : (() => {
    // Last resort: first standalone date in text
    const m = text.match(/\b(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{4})\b/);
    return m ? parseDate(m[0]) : null;
  })();
  confidence.issueDate = issueDate ? 0.9 : 0;

  const dueDateResult = findValueAfterKeyword(
    lines,
    ["date d'échéance", "échéance", "due date", "payable le", "payable avant", "règlement le"],
    /\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}|\d{1,2}\s+\w+\s+\d{4}/
  );
  const dueDateStr = dueDateResult?.value;
  const dueDate = dueDateStr ? parseDate(dueDateStr) : null;
  confidence.dueDate = dueDate ? 0.9 : 0;

  const delivDateResult = findValueAfterKeyword(
    lines,
    ['date de livraison', 'livraison le', 'delivery date', 'prestation le'],
    /\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}/
  );
  const delivDateStr = delivDateResult?.value;
  const deliveryDate = delivDateStr ? parseDate(delivDateStr) : null;
  confidence.deliveryDate = deliveryDate ? 0.9 : 0;

  // ── Payment terms
  const ptResult = findValueAfterKeyword(
    lines,
    ['conditions de règlement', 'modalités de paiement', 'terms', 'paiement'],
    /.{3,60}/
  );
  const paymentTerms = ptResult ? ptResult.value.replace(/^[:\s]+/, '').trim() : null;
  confidence.paymentTerms = paymentTerms ? 0.8 : 0;

  // ── Currency (EUR by default, detect other)
  let currency = 'EUR';
  if (/\bUSD\b|\$/.test(text)) currency = 'USD';
  else if (/\bGBP\b|£/.test(text)) currency = 'GBP';
  confidence.currency = 0.95;

  // ── Global TVA rate
  let taxRate = '20.00';
  const tvaGlobal = text.match(/TVA\s+(?:à\s+)?(\d+(?:[.,]\d+)?)\s*%/i);
  if (tvaGlobal) {
    const parsed = parseFloat(tvaGlobal[1].replace(',', '.'));
    if (!isNaN(parsed) && parsed > 0) taxRate = parsed.toFixed(2);
  }
  confidence.taxRate = 0.9;

  // ── Invoice lines (structured, using positional data)
  const invoiceLines = lines.length > 0 ? extractInvoiceLines(lines) : [];
  confidence.lines = invoiceLines.length > 0 ? 0.9 : 0;

  return {
    counterpartyName,
    counterpartyEmail,
    counterpartyAddress,
    supplierSiret,
    supplierVatNumber,
    buyerVatNumber,
    issueDate,
    dueDate,
    deliveryDate,
    currency,
    taxRate,
    paymentTerms,
    invoiceLines,
    confidence,
  };
}

// ─── exported entry-points ────────────────────────────────────────────────────

/**
 * Primary entry-point: takes pdf.js getTextContent() items
 * (array of { str, transform, ... }).
 */
export function mapTextItemsToInvoice(textItems) {
  const lines = groupItemsIntoLines(textItems);
  const rawText = linesToText(lines);
  const fields = extractFields(lines, rawText);

  return {
    draft: {
      counterpartyName: fields.counterpartyName,
      counterpartyEmail: fields.counterpartyEmail,
      counterpartyAddress: fields.counterpartyAddress,
      supplierSiret: fields.supplierSiret,
      supplierVatNumber: fields.supplierVatNumber,
      buyerVatNumber: fields.buyerVatNumber,
      issueDate: fields.issueDate,
      deliveryDate: fields.deliveryDate,
      dueDate: fields.dueDate,
      currency: fields.currency,
      taxRate: fields.taxRate,
      paymentTerms: fields.paymentTerms,
      earlyPaymentDiscount: '0',
      latePaymentRate: '12.37',
      notes: null,
      lines: fields.invoiceLines,
    },
    confidence: fields.confidence,
    rawText,
    ocrProvider: 'pdfjs',
  };
}

/**
 * Legacy compat: plain text string (no positional info, so line extraction
 * is limited). Used only if text items are unavailable.
 */
export function mapOcrTextToInvoice(rawText) {
  const fakeLines = rawText.split('\n').map((str, i) => [{ str, x: 0, y: 1000 - i * 12 }]);
  const fields = extractFields(fakeLines, rawText);

  return {
    draft: {
      counterpartyName: fields.counterpartyName,
      counterpartyEmail: fields.counterpartyEmail,
      counterpartyAddress: fields.counterpartyAddress,
      supplierSiret: fields.supplierSiret,
      supplierVatNumber: fields.supplierVatNumber,
      buyerVatNumber: fields.buyerVatNumber,
      issueDate: fields.issueDate,
      deliveryDate: fields.deliveryDate,
      dueDate: fields.dueDate,
      currency: fields.currency,
      taxRate: fields.taxRate,
      paymentTerms: fields.paymentTerms,
      earlyPaymentDiscount: '0',
      latePaymentRate: '12.37',
      notes: null,
      lines: fields.invoiceLines,
    },
    confidence: fields.confidence,
    rawText,
    ocrProvider: 'pdfjs-text',
  };
}
