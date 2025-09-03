"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit,
} from "firebase/firestore";

// PDF libs
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminPage() {
  // UI state
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [siteFilter, setSiteFilter] = useState("58A Tarawera Terrace");
  const [systemFilter, setSystemFilter] = useState("");
  const [resultLimit, setResultLimit] = useState(50);
  const [passFailFilter, setPassFailFilter] = useState(""); // "", "pass", "fail"
  const [error, setError] = useState("");

  // --- Load latest docs (simple client-side approach for MVP)
  async function load() {
    setLoading(true);
    setError("");
    try {
      const col = collection(db, "logs");
      const q = query(col, orderBy("createdAt", "desc"), limit(resultLimit));
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // client-side filters
      const filtered = docs.filter((d) => {
        const matchSite =
          !siteFilter?.trim() ||
          (d.siteId || "").toLowerCase().includes(siteFilter.toLowerCase());
        const matchSystem =
          !systemFilter?.trim() ||
          (d.systemId || "").toLowerCase().includes(systemFilter.toLowerCase());
        const matchPF =
          !passFailFilter || (d.passFail || "") === passFailFilter;
        return matchSite && matchSystem && matchPF;
      });

      setRows(filtered);
    } catch (e) {
      console.error(e);
      setError(
        "Could not load logs. Check Firestore rules and your firebase.js config."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Helpers
  function fmtDate(ts) {
    try {
      if (!ts) return "—";
      const date =
        typeof ts.toDate === "function" ? ts.toDate() : new Date(ts);
      return new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "—";
    }
  }

  const last24Months = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 24);
    return d;
  }, []);

  function isWithin24Months(ts) {
    try {
      const date = typeof ts?.toDate === "function" ? ts.toDate() : new Date(ts);
      return date >= last24Months;
    } catch {
      return false;
    }
  }

  // --- PDF Export (with logo in header)
  function exportPDF() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    // Top navy strip
    doc.setFillColor(10, 31, 53);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 50, "F");

    // Try to load logo from /public/logo.png
    const img = new Image();
    img.src = "/logo.png";

    const render = () => {
      // Title area (logo or fallback text)
      try {
        // If img has loaded, draw it
        if (img.complete && img.naturalWidth > 0) {
          doc.addImage(img, "PNG", 40, 10, 80, 30);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(18);
          doc.setTextColor(255, 255, 255);
          doc.text("Inspection Records", 130, 32);
        } else {
          // Fallback text if no image
          doc.setFont("helvetica", "bold");
          doc.setFontSize(18);
          doc.setTextColor(255, 255, 255);
          doc.text("LOGS – Inspection Records", 40, 32);
        }
      } catch {
        // Always have a fallback
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text("LOGS – Inspection Records", 40, 32);
      }

      // Subtitle
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      const subtitle = `Site: ${siteFilter || "All"} • System: ${systemFilter || "All"} • Pass/Fail: ${passFailFilter || "Any"} • Exported: ${new Date().toLocaleString()}`;
      doc.text(subtitle, 40, 65);

      // Build rows (restrict to last 24 months)
      const exportRows = rows
        .filter((r) => isWithin24Months(r.createdAt))
        .map((r) => [
          fmtDate(r.createdAt),
          r.siteId || "—",
          r.systemId || "—",
          r.userName || "—",
          r.company || "—",
          r.passFail === "fail" ? "Fail" : "Pass",
          (r.notes || "").toString(),
        ]);

      autoTable(doc, {
        startY: 80,
        head: [["Date", "Site", "System", "Name", "Company", "Pass/Fail", "Notes"]],
        body: exportRows,
        styles: {
          fontSize: 9,
          cellPadding: 5,
          valign: "top",
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [10, 31, 53],
          textColor: 255,
          fontStyle: "bold",
          halign: "left",
        },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: {
          0: { cellWidth: 80 },   // Date
          1: { cellWidth: 100 },  // Site
          2: { cellWidth: 60 },   // System
          3: { cellWidth: 90 },   // Name
          4: { cellWidth: 100 },  // Company
          5: { cellWidth: 60 },   // Pass/Fail
          6: { cellWidth: "auto" }, // Notes
        },
        margin: { left: 40, right: 40 },
        didDrawPage: () => {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.getHeight();
          const pageWidth = pageSize.getWidth();
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text(
            "This record is a digital reproduction of inspection logs as required under the NZ Building Act 2004.",
            40,
            pageHeight - 24
          );
          doc.text(
            `Page ${doc.internal.getNumberOfPages()}`,
            pageWidth - 80,
            pageHeight - 24
          );
        },
      });

      const fname = `Logs_Export_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fname);
    };

    // If image is cached/ready, render immediately; else wait for onload
    if (img.complete) {
      render();
    } else {
      img.onload = render;
      img.onerror = render; // fallback to text header
    }
  }

  // --- Styles
  const headerStyle = {
    fontWeight: 700,
    background: "#f3f4f6",
    borderBottom: "1px solid #e5e7eb",
    padding: "8px",
    whiteSpace: "nowrap",
  };
  const cellStyle = {
    borderBottom: "1px solid #f1f5f9",
    padding: "8px",
    verticalAlign: "top",
  };
  const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: 14 };
  const toolbarStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 140px 140px 120px",
    gap: 8,
    marginBottom: 12,
  };

  // --- UI
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "#f6f7fb",
        fontFamily: "system-ui, Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          background: "#fff",
          padding: 16,
          borderRadius: 10,
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ color: "#0A1F35", fontSize: 20, fontWeight: 700 }}>
          Admin – Logs
        </h1>

        {/* Toolbar */}
        <div style={toolbarStyle}>
          <input
            placeholder="Filter by site…"
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            style={{
              border: "1px solid #e5e7eb",
              padding: 8,
              borderRadius: 6,
              background: "#fff",
            }}
          />
          <input
            placeholder="Filter by system…"
            value={systemFilter}
            onChange={(e) => setSystemFilter(e.target.value)}
            style={{
              border: "1px solid #e5e7eb",
              padding: 8,
              borderRadius: 6,
              background: "#fff",
            }}
          />
          <select
            value={passFailFilter}
            onChange={(e) => setPassFailFilter(e.target.value)}
            style={{
              border: "1px solid #e5e7eb",
              padding: 8,
              borderRadius: 6,
              background: "#fff",
            }}
          >
            <option value="">Pass/Fail (any)</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
          </select>

          <select
            value={resultLimit}
            onChange={(e) => setResultLimit(parseInt(e.target.value) || 50)}
            style={{
              border: "1px solid #e5e7eb",
              padding: 8,
              borderRadius: 6,
              background: "#fff",
              width: 140,
            }}
          >
            <option value={20}>Show 20</option>
            <option value={50}>Show 50</option>
            <option value={100}>Show 100</option>
          </select>

          <button
            onClick={load}
            disabled={loading}
            style={{
              background: loading ? "#9ca3af" : "#2ECC71",
              color: "#fff",
              padding: 10,
              borderRadius: 6,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
          >
            {loading ? "Loading…" : "Refresh"}
          </button>

          {/* PDF Export */}
          <button
            onClick={exportPDF}
            disabled={rows.length === 0}
            style={{
              background: rows.length === 0 ? "#9ca3af" : "#0A1F35",
              color: "#fff",
              padding: 10,
              borderRadius: 6,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
            }}
          >
            Download PDF
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: 10,
              borderRadius: 6,
              marginBottom: 10,
            }}
          >
            {error}
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerStyle}>Date</th>
                <th style={headerStyle}>Site</th>
                <th style={headerStyle}>System</th>
                <th style={headerStyle}>Name</th>
                <th style={headerStyle}>Company</th>
                <th style={headerStyle}>Pass/Fail</th>
                <th style={headerStyle}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td style={cellStyle}>{fmtDate(r.createdAt)}</td>
                  <td style={cellStyle}>{r.siteId || "—"}</td>
                  <td style={cellStyle}>{r.systemId || "—"}</td>
                  <td style={cellStyle}>{r.userName || "—"}</td>
                  <td style={cellStyle}>{r.company || "—"}</td>
                  <td style={cellStyle} align="center">
                    {r.passFail === "fail" ? "❌ Fail" : "✅ Pass"}
                  </td>
                  <td style={cellStyle}>{r.notes || "—"}</td>
                </tr>
              ))}

              {rows.length === 0 && !loading && (
                <tr>
                  <td style={cellStyle} colSpan={7}>
                    No logs found for current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p style={{ color: "#6b7280", fontSize: 12, marginTop: 12 }}>
          Showing latest {rows.length} entr{rows.length === 1 ? "y" : "ies"} (export restricted to last 24 months).
        </p>
      </div>
    </main>
  );
}