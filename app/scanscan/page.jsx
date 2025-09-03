"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const DEFAULT_SITE = "B:Hive"; // fallback during pilot

export default function Page() {
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

        {/* System (text, under Company) */}
        <input
          placeholder="System (e.g., SS4)"
          value={systemId}
          onChange={(e) => setSystemId(e.target.value)}
          style={{
            width: "100%",
            border: "1px solid #e5e7eb",
            padding: 8,
            borderRadius: 6,
            marginBottom: 12,
            background: "#fff",
          }}
        />

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
