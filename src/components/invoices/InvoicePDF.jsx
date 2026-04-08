import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

/**
 * InvoicePDF — Archival PDF document generated entirely in French.
 * Compliant with Article L441-9 du Code de commerce.
 * All labels are hard-coded French (NOT routed through i18n).
 */

const formatAmountFR = (amount) => {
  if (amount == null || isNaN(Number(amount))) return '0,00 €';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(Number(amount));
};

const formatDateFR = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatTvaRate = (rate) => {
  const r = Number(rate);
  return r.toLocaleString('fr-FR', { minimumFractionDigits: r % 1 === 0 ? 0 : 1 }) + ' %';
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1e3a5f',
    marginBottom: 6,
    marginTop: 14,
  },
  infoBlock: {
    width: '48%',
  },
  label: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 1,
  },
  value: {
    fontSize: 9,
    marginBottom: 4,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f4f8',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  colDesc: { width: '30%' },
  colQty: { width: '10%', textAlign: 'right' },
  colUnit: { width: '15%', textAlign: 'right' },
  colDisc: { width: '10%', textAlign: 'right' },
  colTva: { width: '10%', textAlign: 'right' },
  colTaxAmt: { width: '10%', textAlign: 'right' },
  colTotal: { width: '15%', textAlign: 'right' },
  totalsContainer: {
    alignItems: 'flex-end',
    marginTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 240,
    paddingVertical: 2,
  },
  totalLabel: {
    fontSize: 9,
    color: '#4b5563',
  },
  totalValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  totalTTC: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 240,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#1e3a5f',
    marginTop: 2,
  },
  tvaTable: {
    marginTop: 8,
    marginBottom: 8,
  },
  legalBlock: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderWidth: 0.5,
    borderColor: '#d1d5db',
    borderRadius: 3,
  },
  legalText: {
    fontSize: 8,
    color: '#374151',
    lineHeight: 1.4,
    marginBottom: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 7,
    color: '#9ca3af',
    borderTopWidth: 0.5,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
  },
});

export default function InvoicePDF({ invoice }) {
  if (!invoice) return null;

  // Group lines by TVA rate for the TVA summary table
  const tvaGroups = {};
  (invoice.lines || []).forEach((line) => {
    const rate = line.taxRate?.toString() || '20.00';
    if (!tvaGroups[rate]) {
      tvaGroups[rate] = { baseHT: 0, taxAmount: 0 };
    }
    tvaGroups[rate].baseHT += Number(line.lineTotal) || 0;
    tvaGroups[rate].taxAmount += Number(line.taxAmount) || 0;
  });

  const generatedAt = new Date();
  const generatedStr = `${formatDateFR(generatedAt.toISOString())} à ${String(generatedAt.getHours()).padStart(2, '0')}:${String(generatedAt.getMinutes()).padStart(2, '0')}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>FACTURE FOURNISSEUR</Text>

        {/* Header: Buyer (left) / Supplier (right) */}
        <View style={styles.header}>
          {/* Buyer info (nous — acheteur) */}
          <View style={styles.infoBlock}>
            <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Acheteur</Text>
            <Text style={styles.label}>Raison sociale</Text>
            <Text style={[styles.value, styles.bold]}>Staff Scheduler Pro</Text>
            {invoice.buyerVatNumber && (
              <>
                <Text style={styles.label}>N° TVA intracommunautaire</Text>
                <Text style={styles.value}>{invoice.buyerVatNumber}</Text>
              </>
            )}
          </View>

          {/* Supplier info */}
          <View style={styles.infoBlock}>
            <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Fournisseur</Text>
            <Text style={styles.label}>Raison sociale</Text>
            <Text style={[styles.value, styles.bold]}>{invoice.counterpartyName}</Text>
            {invoice.counterpartyAddress && (
              <>
                <Text style={styles.label}>Adresse</Text>
                <Text style={styles.value}>{invoice.counterpartyAddress}</Text>
              </>
            )}
            {invoice.supplierSiret && (
              <>
                <Text style={styles.label}>SIRET</Text>
                <Text style={styles.value}>{invoice.supplierSiret}</Text>
              </>
            )}
            {invoice.supplierVatNumber && (
              <>
                <Text style={styles.label}>N° TVA intracommunautaire</Text>
                <Text style={styles.value}>{invoice.supplierVatNumber}</Text>
              </>
            )}
            {invoice.counterpartyEmail && (
              <>
                <Text style={styles.label}>Courriel</Text>
                <Text style={styles.value}>{invoice.counterpartyEmail}</Text>
              </>
            )}
          </View>
        </View>

        {/* Invoice reference */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <View>
            <Text style={styles.label}>Numéro de facture</Text>
            <Text style={[styles.value, styles.bold]}>{invoice.invoiceNumber}</Text>
          </View>
          <View>
            <Text style={styles.label}>Date d&apos;émission</Text>
            <Text style={styles.value}>{formatDateFR(invoice.issueDate)}</Text>
          </View>
          {invoice.deliveryDate && (
            <View>
              <Text style={styles.label}>Date de livraison / prestation</Text>
              <Text style={styles.value}>{formatDateFR(invoice.deliveryDate)}</Text>
            </View>
          )}
          <View>
            <Text style={styles.label}>Date d&apos;échéance</Text>
            <Text style={styles.value}>{formatDateFR(invoice.dueDate)}</Text>
          </View>
        </View>

        {/* Lines table */}
        <Text style={styles.sectionTitle}>Détail des lignes</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, styles.bold]}>Désignation</Text>
            <Text style={[styles.colQty, styles.bold]}>Qté</Text>
            <Text style={[styles.colUnit, styles.bold]}>Prix unitaire HT</Text>
            <Text style={[styles.colDisc, styles.bold]}>Remise</Text>
            <Text style={[styles.colTva, styles.bold]}>TVA</Text>
            <Text style={[styles.colTaxAmt, styles.bold]}>Montant TVA</Text>
            <Text style={[styles.colTotal, styles.bold]}>Total HT</Text>
          </View>
          {(invoice.lines || []).map((line, idx) => (
            <View style={styles.tableRow} key={idx}>
              <Text style={styles.colDesc}>{line.description}</Text>
              <Text style={styles.colQty}>{line.qty}</Text>
              <Text style={styles.colUnit}>{formatAmountFR(line.unitPrice)}</Text>
              <Text style={styles.colDisc}>{line.discountPct || 0} %</Text>
              <Text style={styles.colTva}>{formatTvaRate(line.taxRate)}</Text>
              <Text style={styles.colTaxAmt}>{formatAmountFR(line.taxAmount)}</Text>
              <Text style={styles.colTotal}>{formatAmountFR(line.lineTotal)}</Text>
            </View>
          ))}
        </View>

        {/* TVA summary */}
        <Text style={styles.sectionTitle}>Récapitulatif TVA</Text>
        <View style={styles.tvaTable}>
          <View style={styles.tableHeader}>
            <Text style={[{ width: '33%' }, styles.bold]}>Taux TVA</Text>
            <Text style={[{ width: '33%', textAlign: 'right' }, styles.bold]}>Base HT</Text>
            <Text style={[{ width: '34%', textAlign: 'right' }, styles.bold]}>Montant TVA</Text>
          </View>
          {Object.entries(tvaGroups).map(([rate, data]) => (
            <View style={styles.tableRow} key={rate}>
              <Text style={{ width: '33%' }}>{formatTvaRate(rate)}</Text>
              <Text style={{ width: '33%', textAlign: 'right' }}>{formatAmountFR(data.baseHT)}</Text>
              <Text style={{ width: '34%', textAlign: 'right' }}>{formatAmountFR(data.taxAmount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total HT</Text>
            <Text style={styles.totalValue}>{formatAmountFR(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Montant TVA</Text>
            <Text style={styles.totalValue}>{formatAmountFR(invoice.taxAmount)}</Text>
          </View>
          {Number(invoice.discountAmount) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Remise globale</Text>
              <Text style={[styles.totalValue, { color: '#dc2626' }]}>-{formatAmountFR(invoice.discountAmount)}</Text>
            </View>
          )}
          <View style={styles.totalTTC}>
            <Text style={[styles.totalLabel, styles.bold, { fontSize: 12 }]}>Total TTC</Text>
            <Text style={[styles.totalValue, { fontSize: 12 }]}>{formatAmountFR(invoice.totalAmount)}</Text>
          </View>
        </View>

        {/* Legal block — mentions obligatoires */}
        <View style={styles.legalBlock}>
          <Text style={[styles.legalText, styles.bold]}>Conditions de règlement</Text>
          <Text style={styles.legalText}>
            Date d&apos;échéance : {formatDateFR(invoice.dueDate)}
            {invoice.paymentTerms ? ` — ${invoice.paymentTerms}` : ''}
          </Text>

          <Text style={[styles.legalText, styles.bold, { marginTop: 4 }]}>Escompte</Text>
          <Text style={styles.legalText}>
            {Number(invoice.earlyPaymentDiscount) > 0
              ? `Escompte de ${invoice.earlyPaymentDiscount} % consenti pour paiement anticipé.`
              : 'Pas d\u2019escompte consenti pour paiement anticipé.'}
          </Text>

          <Text style={[styles.legalText, styles.bold, { marginTop: 4 }]}>Pénalités de retard</Text>
          <Text style={styles.legalText}>
            En cas de retard de paiement, des pénalités de retard au taux de {invoice.latePaymentRate || '12,37'} % seront exigibles, ainsi qu&apos;une indemnité forfaitaire pour frais de recouvrement de 40 €.
          </Text>
          <Text style={[styles.legalText, { fontSize: 7, color: '#6b7280', marginTop: 2 }]}>
            (Articles L441-10 et D441-5 du Code de commerce)
          </Text>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.legalText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Généré par Staff Scheduler Pro — {generatedStr}
        </Text>
      </Page>
    </Document>
  );
}
