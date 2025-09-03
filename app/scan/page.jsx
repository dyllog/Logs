"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const DEFAULT_SITE = "58A Tarawera Terrace"; // fallback during pilot

export default function Page() {
  // Canonical systems list (cleaned labels)
  const SYSTEM_OPTIONS = [
    { value: "SS1", title: "Automatic systems for fire suppression" },
    { value: "SS2", title: "Automatic or manual alarms" },
    { value: "SS3.1", title: "Automatic doors" },
    { value: "SS3.2", title: "Access control" },
    { value: "SS4", title: "Emergency lighting" },
    { value: "SS5", title: "Escape route pressurisation" },
    { value: "SS6", title: "Riser mains for use by fire services" },
    { value: "SS7", title: "Automatic backflow preventers" },
    { value: "SS8.1", title: "Passenger lifts" },
    { value: "SS9", title: "Mechanical ventilation" },
    { value: "SS10", title: "Building maintenance units" },
    { value: "SS11", title: "Laboratory fume cupboards" },
    { value: "Passives", title: "Passives" },
  ];

  // Pad codes with non‑breaking spaces to align text in monospace select
  const padNbsp = (s, len) => s + "\u00A0".repeat(Math.max(0, len - s.length));
  // Form state
  const [siteId, setSiteId] = useState("");
  const [userName, setUserName] = useState("");
  const [company, setCompany] = useState("");
  const [systemId, setSystemId] = useState("");
  const [notes, setNotes] = useState("");
  const [passFail, setPassFail] = useState("pass"); // "pass" | "fail"
  const [error, setError] = useState("");

  // Read ?site= (locked) and optional ?system= (prefill but editable)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const site = params.get("site") || DEFAULT_SITE;
    const sys = params.get("system") || "";
    setSiteId(site);
    setSystemId(sys);
    // Autofocus name field on load (small UX win)
    const el = document.getElementById("name-input");
    if (el) el.focus();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!siteId?.trim()) {
      setError("This page must be accessed via a site QR link.");
      return;
    }
    if (!userName.trim() || !systemId.trim()) {
      setError("Please enter your name and the system.");
      return;
    }

    try {
      await addDoc(collection(db, "logs"), {
        siteId: siteId.trim(),
        systemId: systemId.trim(),
        userName: userName.trim(),
        company: company.trim(),
        notes: notes.trim(),
        passFail,
        createdAt: serverTimestamp(),
      });

      alert("Inspection logged ✅");

      // Keep site + system to speed multiple entries; clear personal fields
      setUserName("");
      setCompany("");
      setNotes("");
      setPassFail("pass");
      const nameEl = document.getElementById("name-input");
      if (nameEl) nameEl.focus();
    } catch (err) {
      console.error(err);
      setError("Could not save entry. Check connection and try again.");
    }
  }

  const submitDisabled = !siteId?.trim() || !userName.trim() || !systemId.trim();

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: 24,
        background: "#f6f7fb",
        fontFamily: "system-ui, Arial, sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#fff",
          padding: 20,
          borderRadius: 8,
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ color: "#0A1F35", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
          Log Inspection
        </h1>

        {/* SITE (locked — not an input) */}
        <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 10 }}>
          <div>
            <b>Site:</b> {siteId || "—"}
          </div>
        </div>
        <input type="hidden" name="siteId" value={siteId} />

        {/* Name */}
        <input
          id="name-input"
          required
          placeholder="Your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid #e5e7eb",
            padding: 8,
            borderRadius: 6,
            marginBottom: 10,
            background: "#fff",
          }}
        />

        {/* Company */}
        <input
          placeholder="Company (optional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid #e5e7eb",
            padding: 8,
            borderRadius: 6,
            marginBottom: 10,
            background: "#fff",
          }}
        />

        {/* System (dropdown) */}
        <select
          required
          value={systemId}
          onChange={(e) => setSystemId(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid #e5e7eb",
            padding: 8,
            borderRadius: 6,
            marginBottom: 12,
            background: "#fff",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          }}
        >
          <option value="">Select system…</option>
          {SYSTEM_OPTIONS.map((opt) => {
            const code = padNbsp(opt.value, 6); // align hyphens
            return (
              <option key={opt.value} value={opt.value}>
                {`${code} - ${opt.title}`}
              </option>
            );
          })}
        </select>

        {/* Pass / Fail */}
        <div style={{ display: "flex", gap: 16, margin: "8px 0 12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="pf"
              value="pass"
              checked={passFail === "pass"}
              onChange={() => setPassFail("pass")}
            />
            Pass
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="radio"
              name="pf"
              value="fail"
              checked={passFail === "fail"}
              onChange={() => setPassFail("fail")}
            />
            Fail
          </label>
        </div>

        {/* Notes */}
        <textarea
          rows={4}
          placeholder="Notes / observations"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid #e5e7eb",
            padding: 8,
            borderRadius: 6,
            marginBottom: 12,
            background: "#fff",
          }}
        />

        {/* Error message */}
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: 10,
              borderRadius: 6,
              marginBottom: 10,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitDisabled}
          style={{
            width: "100%",
            background: submitDisabled ? "#9ca3af" : "#2ECC71",
            color: "#fff",
            padding: 10,
            borderRadius: 6,
            fontWeight: 700,
            border: "none",
            cursor: submitDisabled ? "not-allowed" : "pointer",
          }}
        >
          Submit
        </button>
      </form>
    </main>
  );
}
