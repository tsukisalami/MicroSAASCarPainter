"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  shopName: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  shopDetail: { fontSize: 9, color: "#666" },
  quoteTitle: { fontSize: 14, fontWeight: "bold", textAlign: "right" },
  quoteNumber: { fontSize: 10, color: "#666", textAlign: "right", marginTop: 2 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#ddd", paddingBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  label: { color: "#666", fontSize: 9 },
  value: { fontSize: 10 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#333", paddingBottom: 4, marginBottom: 4 },
  tableRow: { flexDirection: "row", paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: "#eee" },
  colDesc: { flex: 3 },
  colCat: { flex: 1.5 },
  colAmount: { flex: 1, textAlign: "right" },
  thText: { fontSize: 9, fontWeight: "bold" },
  totalsSection: { marginTop: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#333" },
  totalRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 2 },
  totalLabel: { width: 120, textAlign: "right", paddingRight: 12 },
  totalValue: { width: 80, textAlign: "right" },
  grandTotal: { fontSize: 14, fontWeight: "bold" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, textAlign: "center", fontSize: 8, color: "#999" },
  notes: { backgroundColor: "#f9f9f9", padding: 8, borderRadius: 4, marginTop: 8 },
});

function fmt(val: string | number | null) {
  const n = typeof val === "string" ? parseFloat(val) : (val ?? 0);
  return `$${n.toFixed(2)}`;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface QuotePdfProps {
  quote: any;
  lineItems: any[];
  shop: any;
  customer: any | null;
}

function QuotePdfDocument({ quote, lineItems, shop, customer }: QuotePdfProps) {
  const panels: string[] = quote.panels
    ? JSON.parse(quote.panels as string)
    : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.shopName}>{shop.name as string}</Text>
            {shop.address && <Text style={styles.shopDetail}>{shop.address as string}</Text>}
            {(shop.city || shop.state || shop.zip) && (
              <Text style={styles.shopDetail}>
                {[shop.city, shop.state, shop.zip].filter(Boolean).join(", ")}
              </Text>
            )}
            {shop.phone && <Text style={styles.shopDetail}>{shop.phone as string}</Text>}
            {shop.email && <Text style={styles.shopDetail}>{shop.email as string}</Text>}
          </View>
          <View>
            <Text style={styles.quoteTitle}>QUOTE</Text>
            <Text style={styles.quoteNumber}>{quote.quoteNumber as string}</Text>
            <Text style={styles.quoteNumber}>
              Date: {new Date(quote.createdAt as string).toLocaleDateString()}
            </Text>
            {quote.validUntil && (
              <Text style={styles.quoteNumber}>
                Valid until: {new Date(quote.validUntil as string).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        {/* Customer & Vehicle */}
        <View style={{ flexDirection: "row", marginBottom: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Customer</Text>
            {customer ? (
              <>
                <Text style={styles.value}>{customer.name as string}</Text>
                {customer.email && <Text style={styles.shopDetail}>{customer.email as string}</Text>}
                {customer.phone && <Text style={styles.shopDetail}>{customer.phone as string}</Text>}
              </>
            ) : (
              <Text style={styles.shopDetail}>Walk-in customer</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Vehicle</Text>
            <Text style={styles.value}>
              {[quote.vehicleYear, quote.vehicleMake, quote.vehicleModel]
                .filter(Boolean)
                .join(" ") || "Not specified"}
            </Text>
            {quote.vehicleColor && (
              <Text style={styles.shopDetail}>Current: {quote.vehicleColor as string}</Text>
            )}
            {quote.paintColor && (
              <Text style={styles.shopDetail}>
                New: {quote.paintColor as string} ({quote.finishType as string})
              </Text>
            )}
            {panels.length > 0 && (
              <Text style={styles.shopDetail}>Panels: {panels.join(", ")}</Text>
            )}
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.thText, styles.colDesc]}>Description</Text>
            <Text style={[styles.thText, styles.colCat]}>Category</Text>
            <Text style={[styles.thText, styles.colAmount]}>Amount</Text>
          </View>
          {lineItems.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description as string}</Text>
              <Text style={[styles.colCat, { color: "#666" }]}>
                {item.category as string}
              </Text>
              <Text style={styles.colAmount}>{fmt(item.total as string)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Labor ({quote.laborHours as string} hrs)
            </Text>
            <Text style={styles.totalValue}>{fmt(quote.laborTotal as string)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Materials & Supplies</Text>
            <Text style={styles.totalValue}>
              {fmt(quote.materialsTotal as string)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { fontWeight: "bold" }]}>
              Subtotal
            </Text>
            <Text style={[styles.totalValue, { fontWeight: "bold" }]}>
              {fmt(quote.subtotal as string)}
            </Text>
          </View>
          {parseFloat(quote.taxAmount as string) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax</Text>
              <Text style={styles.totalValue}>
                {fmt(quote.taxAmount as string)}
              </Text>
            </View>
          )}
          <View style={[styles.totalRow, { marginTop: 6 }]}>
            <Text style={[styles.totalLabel, styles.grandTotal]}>TOTAL</Text>
            <Text style={[styles.totalValue, styles.grandTotal]}>
              {fmt(quote.total as string)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={styles.notes}>
            <Text style={{ fontWeight: "bold", marginBottom: 2 }}>Notes</Text>
            <Text>{quote.notes as string}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by QuotePaint &bull; This quote is valid for 30 days from
          the date above.
        </Text>
      </Page>
    </Document>
  );
}

export async function generateQuotePdf(data: QuotePdfProps): Promise<Blob> {
  const blob = await pdf(<QuotePdfDocument {...data} />).toBlob();
  return blob;
}

export { QuotePdfDocument };
