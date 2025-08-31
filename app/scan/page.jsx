"use client";
import { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const SITE_NAME = "58A Tarawera Terrace"; // 🔒 locked for this QR/page

export default function Page() {
  const [userName, setUserName] = useState("");
  const [company, setCompany] = useState("");
  const [systemId, setSystemId] = useState("");   // now under Company
  const [notes, setNotes] = useState("");
  const [passFail, setPassFail] = useState("pass");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!userName.trim() || !systemId.trim()) {
      alert("Please enter your name and the system.");
      return;
    }
    await addDoc(collection(db, "logs"), {
      siteId: SITE_NAME,                 // always this site
      systemId: systemId.trim(),
      userName: userName.trim(),
      company: company.trim(),
      notes: notes.trim(),
      passFail,
      createdAt: serverTimestamp(),
    });
    alert("Inspection logged ✅");
    // keep site + system for speed; clear personal fields
    setUserName("");
    setCompany("");
    setNotes("");
    setPassFail("pass");
  }

  const disabled = !userName.trim() || !systemId.trim();

  return (
    <main style={{minHeight:"100vh", display:"flex", justifyContent:"center", padding:24, background:"#f6f7fb"}}>
      <form onSubmit={handleSubmit} style={{width:"100%", maxWidth:480, background:"#fff", padding:20, borderRadius:8, boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
        <h1 style={{color:"#0A1F35", fontSize:20, fontWeight:700, marginBottom:12}}>Log Inspection</h1>

        {/* SITE (locked — not an input) */}
        <div style={{fontSize:13, color:"#4b5563", marginBottom:8}}>
          <div><b>Site:</b> {SITE_NAME}</div>
        </div>
        {/* Hidden input is handy if you ever post as a form */}
        <input type="hidden" name="siteId" value={SITE_NAME} />

        {/* Name */}
        <input
          required
          placeholder="Your name"
          value={userName}
          onChange={(e)=>setUserName(e.target.value)}
          style={{width:"100%", border:"1px solid #e5e7eb", padding:8, borderRadius:6, marginBottom:10}}
        />

        {/* Company */}
        <input
          placeholder="Company (optional)"
          value={company}
          onChange={(e)=>setCompany(e.target.value)}
          style={{width:"100%", border:"1px solid #e5e7eb", padding:8, borderRadius:6, marginBottom:10}}
        />

        {/* System (NOW under Company, editable text) */}
        <input
          placeholder="System (e.g., SS4)"
          value={systemId}
          onChange={(e)=>setSystemId(e.target.value)}
          style={{width:"100%", border:"1px solid #e5e7eb", padding:8, borderRadius:6, marginBottom:12}}
        />

        {/* Pass / Fail */}
        <div style={{display:"flex", gap:16, margin:"8px 0 12px"}}>
          <label style={{display:"flex", alignItems:"center", gap:6}}>
            <input type="radio" name="pf" value="pass" checked={passFail==="pass"} onChange={()=>setPassFail("pass")} />
            Pass
          </label>
          <label style={{display:"flex", alignItems:"center", gap:6}}>
            <input type="radio" name="pf" value="fail" checked={passFail==="fail"} onChange={()=>setPassFail("fail")} />
            Fail
          </label>
        </div>

        {/* Notes */}
        <textarea
          rows={4}
          placeholder="Notes / observations"
          value={notes}
          onChange={(e)=>setNotes(e.target.value)}
          style={{width:"100%", border:"1px solid #e5e7eb", padding:8, borderRadius:6, marginBottom:12}}
        />

        <button
          type="submit"
          disabled={disabled}
          style={{width:"100%", background: disabled ? "#9ca3af" : "#2ECC71", color:"#fff", padding:10, borderRadius:6, fontWeight:700}}
        >
          Submit
        </button>
      </form>
    </main>
  );
}
