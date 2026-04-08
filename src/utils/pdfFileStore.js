/**
 * Module-level store for PDF File objects.
 * File objects cannot reliably survive React Router's history state serialization.
 * This store holds the file in memory between the import modal and the review page.
 */
let _pdfFile = null;

export function storePdfFile(file) {
  _pdfFile = file;
}

export function retrievePdfFile() {
  return _pdfFile;
}

export function clearPdfFile() {
  _pdfFile = null;
}
