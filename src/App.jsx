import { useState, useEffect, useCallback } from "react";

const DEFAULT_KINES = [
  { id: "salva", name: "Salva", color: "#2563eb" },
  { id: "tucha", name: "Tucha", color: "#7c3aed" },
  { id: "jokin", name: "Jokin", color: "#059669" },
  { id: "tomi",  name: "Tomi",  color: "#dc2626" },
];

const COLOR_OPTIONS = [
  "#2563eb", "#7c3aed", "#059669", "#dc2626",
  "#d97706", "#0891b2", "#db2777", "#65a30d",
  "#9333ea", "#ea580c", "#0284c7", "#16a34a",
];

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const emptyWeekData = () => ({ disponiblesMes: 0, disponiblesKine: 0, dados: 0, asistidos: 0 });
const emptyMonthData = () => ({ weeks: [emptyWeekData(), emptyWeekData(), emptyWeekData(), emptyWeekData()] });
const emptyReplacements = () => ([]);

const initDataForKines = (kines) => {
  const data = {};
  kines.forEach(k => {
    data[k.id] = {};
    MONTHS.forEach((_, mi) => { data[k.id][mi] = emptyMonthData(); });
  });
  return data;
};

const initReplacements = () => {
  const r = {};
  MONTHS.forEach((_, mi) => { r[mi] = emptyReplacements(); });
  return r;
};

const STORAGE_KEY = "kines-hours-data-v2";
const REPL_KEY = "kines-replacements-v2";
const KINES_KEY = "kines-team-list-v1";

const LOGO_BASE64 = "data:image/png;base64,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";

export default function App() {
  const [kines, setKines] = useState(DEFAULT_KINES);
  const [data, setData] = useState(() => initDataForKines(DEFAULT_KINES));
  const [replacements, setReplacements] = useState(initReplacements);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(2026);
  const [view, setView] = useState("semanal");
  const [selectedKine, setSelectedKine] = useState("salva");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newReplName, setNewReplName] = useState("");
  const [newReplHours, setNewReplHours] = useState("");
  const [newReplReemplaza, setNewReplReemplaza] = useState("");
  const [copied, setCopied] = useState(false);

  // Gestión de kines - modal
  const [showKinesPanel, setShowKinesPanel] = useState(false);
  const [newKineName, setNewKineName] = useState("");
  const [newKineColor, setNewKineColor] = useState(COLOR_OPTIONS[0]);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Load from storage
  useEffect(() => {
    let done = false;
    const timeout = setTimeout(() => { if (!done) { done = true; setLoading(false); } }, 2000);
    (async () => {
      try {
        if (window.storage) {
          let loadedKines = DEFAULT_KINES;
          try {
            const res = await window.storage.get(KINES_KEY);
            if (res && res.value) { loadedKines = JSON.parse(res.value); setKines(loadedKines); }
          } catch (e) {}
          try {
            const res = await window.storage.get(STORAGE_KEY);
            if (res && res.value) {
              const parsed = JSON.parse(res.value);
              // Ensure all kines have data slots
              loadedKines.forEach(k => {
                if (!parsed[k.id]) {
                  parsed[k.id] = {};
                  MONTHS.forEach((_, mi) => { parsed[k.id][mi] = emptyMonthData(); });
                } else {
                  MONTHS.forEach((_, mi) => { if (!parsed[k.id][mi]) parsed[k.id][mi] = emptyMonthData(); });
                }
              });
              setData(parsed);
            }
          } catch (e) {}
          try {
            const res = await window.storage.get(REPL_KEY);
            if (res && res.value) setReplacements(JSON.parse(res.value));
          } catch (e) {}
        }
      } catch (e) {}
      if (!done) { done = true; clearTimeout(timeout); setLoading(false); }
    })();
    return () => clearTimeout(timeout);
  }, []);

  const save = useCallback(async (newData, newRepl, newKines) => {
    setSaving(true);
    try {
      if (window.storage) {
        await window.storage.set(STORAGE_KEY, JSON.stringify(newData || data));
        await window.storage.set(REPL_KEY, JSON.stringify(newRepl || replacements));
        await window.storage.set(KINES_KEY, JSON.stringify(newKines || kines));
      }
    } catch (e) {}
    setSaving(false);
  }, [data, replacements, kines]);

  const updateWeekField = (kineId, monthIdx, weekIdx, field, value) => {
    const val = value === "" ? 0 : Math.max(0, parseInt(value) || 0);
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[kineId][monthIdx].weeks[weekIdx][field] = val;
      save(next, replacements, kines);
      return next;
    });
  };

  const addWeek = (kineId, monthIdx) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (next[kineId][monthIdx].weeks.length < 6) {
        next[kineId][monthIdx].weeks.push(emptyWeekData());
        save(next, replacements, kines);
      }
      return next;
    });
  };

  const removeWeek = (kineId, monthIdx) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (next[kineId][monthIdx].weeks.length > 1) {
        next[kineId][monthIdx].weeks.pop();
        save(next, replacements, kines);
      }
      return next;
    });
  };

  const addReplacement = () => {
    if (!newReplName.trim() || !newReplHours) return;
    setReplacements(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[month].push({ name: newReplName.trim(), hours: parseInt(newReplHours) || 0, reemplaza: newReplReemplaza });
      save(data, next, kines);
      return next;
    });
    setNewReplName(""); setNewReplHours(""); setNewReplReemplaza("");
  };

  const removeReplacement = (idx) => {
    setReplacements(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[month].splice(idx, 1);
      save(data, next, kines);
      return next;
    });
  };

  // --- Gestión de kinesiólogos ---
  const addKine = () => {
    if (!newKineName.trim()) return;
    const id = newKineName.trim().toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    const newK = { id, name: newKineName.trim(), color: newKineColor };
    const nextKines = [...kines, newK];

    const nextData = JSON.parse(JSON.stringify(data));
    nextData[id] = {};
    MONTHS.forEach((_, mi) => { nextData[id][mi] = emptyMonthData(); });

    setKines(nextKines);
    setData(nextData);
    save(nextData, replacements, nextKines);
    setNewKineName(""); setNewKineColor(COLOR_OPTIONS[0]);
  };

  const deleteKine = (id) => {
    if (kines.length <= 1) return;
    const nextKines = kines.filter(k => k.id !== id);
    setKines(nextKines);
    if (selectedKine === id) setSelectedKine(nextKines[0].id);
    save(data, replacements, nextKines);
    setConfirmDeleteId(null);
  };

  const getMonthTotals = (kineId, monthIdx) => {
    if (!data[kineId] || !data[kineId][monthIdx]) return { disponiblesMes: 0, disponiblesKine: 0, dados: 0, asistidos: 0, cancelados: 0 };
    const weeks = data[kineId][monthIdx].weeks;
    return {
      disponiblesMes: weeks.reduce((s, w) => s + w.disponiblesMes, 0),
      disponiblesKine: weeks.reduce((s, w) => s + w.disponiblesKine, 0),
      dados: weeks.reduce((s, w) => s + w.dados, 0),
      asistidos: weeks.reduce((s, w) => s + w.asistidos, 0),
      cancelados: weeks.reduce((s, w) => s + (w.dados - w.asistidos), 0),
    };
  };

  const getGeneralMonth = (monthIdx) => {
    const totals = { disponiblesMes: 0, disponiblesKine: 0, dados: 0, asistidos: 0, cancelados: 0 };
    kines.forEach(k => {
      const mt = getMonthTotals(k.id, monthIdx);
      totals.disponiblesMes += mt.disponiblesMes;
      totals.disponiblesKine += mt.disponiblesKine;
      totals.dados += mt.dados;
      totals.asistidos += mt.asistidos;
      totals.cancelados += mt.cancelados;
    });
    totals.reemplazos = (replacements[monthIdx] || []).reduce((s, r) => s + r.hours, 0);
    return totals;
  };

  const pct = (a, b) => b === 0 ? "—" : `${Math.round((a / b) * 100)}%`;

  const exportResumen = () => {
    let text = `══════════════════════════════════\n`;
    text += `  RESUMEN ${MONTHS[month].toUpperCase()} ${year}\n`;
    text += `  Grupo Agile — Kinesiología\n`;
    text += `══════════════════════════════════\n\n`;
    kines.forEach(k => {
      const t = getMonthTotals(k.id, month);
      text += `▸ ${k.name.toUpperCase()} (${k.days.join(", ")})\n`;
      text += `  Turnos disp. mes:   ${t.disponiblesMes}\n`;
      text += `  Turnos disp. kine:  ${t.disponiblesKine}\n`;
      text += `  Turnos dados:       ${t.dados}\n`;
      text += `  Turnos asistidos:   ${t.asistidos}\n`;
      text += `  Cancelados:         ${t.cancelados}\n`;
      text += `  % Asistencia:       ${pct(t.asistidos, t.dados)}\n\n`;
    });
    const g = getGeneralMonth(month);
    text += `──────────────────────────────────\n  TOTAL GENERAL\n──────────────────────────────────\n`;
    text += `  Turnos disp. mes:   ${g.disponiblesMes}\n`;
    text += `  Turnos disp. kine:  ${g.disponiblesKine}\n`;
    text += `  Turnos dados:       ${g.dados}\n`;
    text += `  Turnos asistidos:   ${g.asistidos}\n`;
    text += `  Cancelados:         ${g.cancelados}\n`;
    text += `  % Asistencia:       ${pct(g.asistidos, g.dados)}\n\n`;
    const repls = replacements[month] || [];
    if (repls.length > 0) {
      text += `──────────────────────────────────\n  REEMPLAZOS\n──────────────────────────────────\n`;
      repls.forEach(r => { text += `  ${r.name}${r.reemplaza ? ` → reemplaza a ${r.reemplaza}` : ""}: ${r.hours}hs\n`; });
      text += `  Total reemplazos: ${repls.reduce((s, r) => s + r.hours, 0)}hs\n`;
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    }).catch(() => window.prompt("Copiá este texto:", text));
  };

  const kineObj = kines.find(k => k.id === selectedKine) || kines[0];

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
        <p style={{ fontSize: 18, color: "#64748b" }}>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", minHeight: "100vh", color: "#e2e8f0", padding: "0" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "rgba(15,23,42,0.8)", borderBottom: "1px solid rgba(148,163,184,0.1)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={LOGO_BASE64} alt="Grupo Agile" style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover" }} />
          <div>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>Grupo Agile</h1>
            <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Kinesiología — Control de Horas {year}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {saving && <span style={{ fontSize: 11, color: "#facc15", fontFamily: "'Space Mono', monospace" }}>Guardando...</span>}
          <button onClick={() => setShowKinesPanel(true)} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "rgba(51,65,85,0.4)", border: "1px solid rgba(148,163,184,0.2)", color: "#94a3b8", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
            ⚙ Equipo
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: 0, padding: "12px 24px", borderBottom: "1px solid rgba(148,163,184,0.08)", overflowX: "auto" }}>
        {[{ key: "semanal", label: "Semanal" }, { key: "mensual", label: "Mensual" }, { key: "general", label: "General" }, { key: "anual", label: "Anual" }].map(v => (
          <button key={v.key} onClick={() => setView(v.key)} style={{ padding: "8px 20px", background: view === v.key ? "rgba(37,99,235,0.2)" : "transparent", border: "1px solid", borderColor: view === v.key ? "#2563eb" : "transparent", borderRadius: 8, color: view === v.key ? "#60a5fa" : "#94a3b8", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>{v.label}</button>
        ))}
      </div>

      {/* Month + Kine selector */}
      <div style={{ padding: "12px 24px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <select value={month} onChange={e => setMonth(parseInt(e.target.value))} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "8px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(parseInt(e.target.value))} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", padding: "8px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
          {[2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {(view === "semanal" || view === "mensual") && (
          <div style={{ display: "flex", gap: 4, marginLeft: "auto", flexWrap: "wrap" }}>
            {kines.map(k => (
              <button key={k.id} onClick={() => setSelectedKine(k.id)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "2px solid", borderColor: selectedKine === k.id ? k.color : "transparent", background: selectedKine === k.id ? `${k.color}22` : "rgba(51,65,85,0.3)", color: selectedKine === k.id ? k.color : "#94a3b8", cursor: "pointer", transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif" }}>{k.name}</button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "8px 24px 24px" }}>

        {/* VISTA SEMANAL */}
        {view === "semanal" && kineObj && data[kineObj.id] && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>
                <span style={{ color: kineObj.color }}>{kineObj.name}</span> — {MONTHS[month]}
              </h2>

            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button onClick={() => addWeek(selectedKine, month)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "rgba(37,99,235,0.15)", border: "1px solid #2563eb33", color: "#60a5fa", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>+ Agregar semana</button>
              <button onClick={() => removeWeek(selectedKine, month)} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "rgba(220,38,38,0.1)", border: "1px solid #dc262633", color: "#f87171", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>- Quitar semana</button>
              <span style={{ fontSize: 12, color: "#64748b", alignSelf: "center", fontFamily: "'Space Mono', monospace" }}>{data[selectedKine][month].weeks.length} semanas</span>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 180 }}>Métrica</th>
                    {data[selectedKine][month].weeks.map((_, i) => <th key={i} style={thStyle}>Sem {i + 1}</th>)}
                    <th style={{ ...thStyle, color: "#facc15" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[{ key: "disponiblesMes", label: "Turnos disp. mes" }, { key: "disponiblesKine", label: "Turnos disp. kine" }, { key: "dados", label: "Turnos dados" }, { key: "asistidos", label: "Turnos asistidos" }].map(field => (
                    <tr key={field.key}>
                      <td style={labelStyle}>{field.label}</td>
                      {data[selectedKine][month].weeks.map((w, wi) => (
                        <td key={wi} style={cellStyle}>
                          <input type="number" min="0" value={w[field.key] || ""} placeholder="0" onChange={e => updateWeekField(selectedKine, month, wi, field.key, e.target.value)} style={inputStyle} />
                        </td>
                      ))}
                      <td style={{ ...cellStyle, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: "#facc15" }}>
                        {data[selectedKine][month].weeks.reduce((s, w) => s + (w[field.key] || 0), 0)}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ ...labelStyle, color: "#f87171" }}>Cancelados</td>
                    {data[selectedKine][month].weeks.map((w, wi) => (
                      <td key={wi} style={{ ...cellStyle, fontFamily: "'Space Mono', monospace", color: "#f87171" }}>{w.dados - w.asistidos}</td>
                    ))}
                    <td style={{ ...cellStyle, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: "#f87171" }}>
                      {data[selectedKine][month].weeks.reduce((s, w) => s + (w.dados - w.asistidos), 0)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ ...labelStyle, color: "#60a5fa" }}>% Asistencia</td>
                    {data[selectedKine][month].weeks.map((w, wi) => (
                      <td key={wi} style={{ ...cellStyle, fontFamily: "'Space Mono', monospace", color: "#60a5fa" }}>{pct(w.asistidos, w.dados)}</td>
                    ))}
                    <td style={{ ...cellStyle, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: "#60a5fa" }}>
                      {pct(data[selectedKine][month].weeks.reduce((s, w) => s + w.asistidos, 0), data[selectedKine][month].weeks.reduce((s, w) => s + w.dados, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Reemplazos */}
            <div style={{ marginTop: 24, padding: 16, borderRadius: 12, background: "rgba(51,65,85,0.2)", border: "1px solid rgba(148,163,184,0.1)" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#fbbf24" }}>Reemplazos — {MONTHS[month]}</h3>
              {(replacements[month] || []).map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, background: "rgba(251,191,36,0.05)", padding: "8px 12px", borderRadius: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</span>
                  {r.reemplaza && <span style={{ fontSize: 12, color: "#94a3b8" }}>→ reemplaza a <strong>{r.reemplaza}</strong></span>}
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#fbbf24" }}>{r.hours}hs</span>
                  <button onClick={() => removeReplacement(i)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <input placeholder="Nombre" value={newReplName} onChange={e => setNewReplName(e.target.value)} style={{ ...inputStyle, width: 120 }} />
                <select value={newReplReemplaza} onChange={e => setNewReplReemplaza(e.target.value)} style={{ background: "rgba(15,23,42,0.6)", border: "1px solid #334155", borderRadius: 6, color: "#e2e8f0", padding: "6px 8px", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}>
                  <option value="">¿A quién reemplaza?</option>
                  {kines.map(k => <option key={k.id} value={k.name}>{k.name}</option>)}
                </select>
                <input type="number" placeholder="Horas" value={newReplHours} onChange={e => setNewReplHours(e.target.value)} style={{ ...inputStyle, width: 70 }} />
                <button onClick={addReplacement} style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, background: "rgba(251,191,36,0.2)", border: "1px solid #fbbf2433", color: "#fbbf24", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>+ Agregar</button>
              </div>
            </div>
          </div>
        )}

        {/* VISTA MENSUAL */}
        {view === "mensual" && kineObj && (
          <div>
            <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700 }}>
              <span style={{ color: kineObj.color }}>{kineObj.name}</span> — Resumen {MONTHS[month]}
            </h2>
            {(() => {
              const t = getMonthTotals(selectedKine, month);
              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                  {[{ label: "Disp. Mes", value: t.disponiblesMes, color: "#94a3b8" }, { label: "Disp. Kine", value: t.disponiblesKine, color: "#60a5fa" }, { label: "Dados", value: t.dados, color: "#a78bfa" }, { label: "Asistidos", value: t.asistidos, color: "#34d399" }, { label: "Cancelados", value: t.cancelados, color: "#f87171" }, { label: "% Asistencia", value: pct(t.asistidos, t.dados), color: "#facc15" }].map((item, i) => (
                    <div key={i} style={{ background: "rgba(30,41,59,0.6)", borderRadius: 12, padding: 16, border: `1px solid ${item.color}22` }}>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4, fontWeight: 600 }}>{item.label}</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: item.color, fontFamily: "'Space Mono', monospace" }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
            {(() => {
              const t = getMonthTotals(selectedKine, month);
              const max = Math.max(t.disponiblesMes, 1);
              return (
                <div style={{ marginTop: 24 }}>
                  {[{ label: "Disp. Mes", value: t.disponiblesMes, color: "#475569" }, { label: "Disp. Kine", value: t.disponiblesKine, color: "#2563eb" }, { label: "Dados", value: t.dados, color: "#7c3aed" }, { label: "Asistidos", value: t.asistidos, color: "#059669" }, { label: "Cancelados", value: t.cancelados, color: "#dc2626" }].map((b, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: "#94a3b8" }}>{b.label}</span>
                        <span style={{ fontFamily: "'Space Mono', monospace", color: b.color }}>{b.value}</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: "rgba(51,65,85,0.4)" }}>
                        <div style={{ height: "100%", borderRadius: 4, background: b.color, width: `${(b.value / max) * 100}%`, transition: "width 0.5s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* VISTA GENERAL */}
        {view === "general" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>General — {MONTHS[month]} {year}</h2>
              <button onClick={exportResumen} style={{ padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: copied ? "rgba(52,211,153,0.2)" : "linear-gradient(135deg, rgba(37,99,235,0.25), rgba(124,58,237,0.25))", border: copied ? "1px solid #34d39955" : "1px solid rgba(96,165,250,0.3)", color: copied ? "#34d399" : "#60a5fa", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.3s" }}>
                {copied ? "✓ Copiado al portapapeles" : "📋 Exportar resumen"}
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Kine</th>
                    <th style={thStyle}>Disp. Mes</th>
                    <th style={thStyle}>Disp. Kine</th>
                    <th style={thStyle}>Dados</th>
                    <th style={thStyle}>Asistidos</th>
                    <th style={thStyle}>Cancelados</th>
                    <th style={thStyle}>% Asist.</th>
                  </tr>
                </thead>
                <tbody>
                  {kines.map(k => {
                    const t = getMonthTotals(k.id, month);
                    return (
                      <tr key={k.id}>
                        <td style={{ ...labelStyle, color: k.color }}>{k.name}</td>
                        <td style={monoCell}>{t.disponiblesMes}</td>
                        <td style={monoCell}>{t.disponiblesKine}</td>
                        <td style={monoCell}>{t.dados}</td>
                        <td style={{ ...monoCell, color: "#34d399" }}>{t.asistidos}</td>
                        <td style={{ ...monoCell, color: "#f87171" }}>{t.cancelados}</td>
                        <td style={{ ...monoCell, color: "#facc15" }}>{pct(t.asistidos, t.dados)}</td>
                      </tr>
                    );
                  })}
                  {(() => {
                    const g = getGeneralMonth(month);
                    return (
                      <tr style={{ borderTop: "2px solid #334155" }}>
                        <td style={{ ...labelStyle, fontWeight: 700, color: "#e2e8f0" }}>TOTAL</td>
                        <td style={{ ...monoCell, fontWeight: 700 }}>{g.disponiblesMes}</td>
                        <td style={{ ...monoCell, fontWeight: 700 }}>{g.disponiblesKine}</td>
                        <td style={{ ...monoCell, fontWeight: 700 }}>{g.dados}</td>
                        <td style={{ ...monoCell, fontWeight: 700, color: "#34d399" }}>{g.asistidos}</td>
                        <td style={{ ...monoCell, fontWeight: 700, color: "#f87171" }}>{g.cancelados}</td>
                        <td style={{ ...monoCell, fontWeight: 700, color: "#facc15" }}>{pct(g.asistidos, g.dados)}</td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
            {(replacements[month] || []).length > 0 && (
              <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.15)" }}>
                <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: "#fbbf24" }}>Reemplazos</h3>
                {replacements[month].map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, fontSize: 13, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{r.name}</span>
                    {r.reemplaza && <span style={{ color: "#94a3b8" }}>→ {r.reemplaza}</span>}
                    <span style={{ fontFamily: "'Space Mono', monospace", color: "#fbbf24" }}>{r.hours}hs</span>
                  </div>
                ))}
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(251,191,36,0.2)", fontSize: 13, fontWeight: 700 }}>
                  Total reemplazos: <span style={{ fontFamily: "'Space Mono', monospace", color: "#fbbf24" }}>{replacements[month].reduce((s, r) => s + r.hours, 0)}hs</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VISTA ANUAL */}
        {view === "anual" && (
          <div>
            <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700 }}>Resumen Anual — {year}</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Mes</th>
                    <th style={thStyle}>Disp. Mes</th>
                    <th style={thStyle}>Disp. Kine</th>
                    <th style={thStyle}>Dados</th>
                    <th style={thStyle}>Asistidos</th>
                    <th style={thStyle}>Cancel.</th>
                    <th style={thStyle}>% Asist.</th>
                    <th style={thStyle}>Reempl.</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHS.map((m, mi) => {
                    const g = getGeneralMonth(mi);
                    const replH = (replacements[mi] || []).reduce((s, r) => s + r.hours, 0);
                    const hasData = g.disponiblesMes > 0 || g.dados > 0;
                    return (
                      <tr key={mi} style={{ opacity: hasData ? 1 : 0.3 }}>
                        <td style={{ ...labelStyle, cursor: "pointer" }} onClick={() => { setMonth(mi); setView("general"); }}>{m}</td>
                        <td style={monoCell}>{g.disponiblesMes}</td>
                        <td style={monoCell}>{g.disponiblesKine}</td>
                        <td style={monoCell}>{g.dados}</td>
                        <td style={{ ...monoCell, color: "#34d399" }}>{g.asistidos}</td>
                        <td style={{ ...monoCell, color: "#f87171" }}>{g.cancelados}</td>
                        <td style={{ ...monoCell, color: "#facc15" }}>{pct(g.asistidos, g.dados)}</td>
                        <td style={{ ...monoCell, color: "#fbbf24" }}>{replH > 0 ? `${replH}hs` : "—"}</td>
                      </tr>
                    );
                  })}
                  {(() => {
                    const totals = { dm: 0, dk: 0, d: 0, a: 0, c: 0, r: 0 };
                    MONTHS.forEach((_, mi) => {
                      const g = getGeneralMonth(mi);
                      totals.dm += g.disponiblesMes; totals.dk += g.disponiblesKine; totals.d += g.dados; totals.a += g.asistidos; totals.c += g.cancelados;
                      totals.r += (replacements[mi] || []).reduce((s, r) => s + r.hours, 0);
                    });
                    return (
                      <tr style={{ borderTop: "2px solid #334155" }}>
                        <td style={{ ...labelStyle, fontWeight: 700 }}>TOTAL ANUAL</td>
                        <td style={{ ...monoCell, fontWeight: 700 }}>{totals.dm}</td>
                        <td style={{ ...monoCell, fontWeight: 700 }}>{totals.dk}</td>
                        <td style={{ ...monoCell, fontWeight: 700 }}>{totals.d}</td>
                        <td style={{ ...monoCell, fontWeight: 700, color: "#34d399" }}>{totals.a}</td>
                        <td style={{ ...monoCell, fontWeight: 700, color: "#f87171" }}>{totals.c}</td>
                        <td style={{ ...monoCell, fontWeight: 700, color: "#facc15" }}>{pct(totals.a, totals.d)}</td>
                        <td style={{ ...monoCell, fontWeight: 700, color: "#fbbf24" }}>{totals.r > 0 ? `${totals.r}hs` : "—"}</td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Evolución mensual</h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120 }}>
                {MONTHS.map((m, mi) => {
                  const g = getGeneralMonth(mi);
                  const maxAll = Math.max(...MONTHS.map((_, i) => getGeneralMonth(i).asistidos), 1);
                  const h = (g.asistidos / maxAll) * 100;
                  return (
                    <div key={mi} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: "#64748b" }}>{g.asistidos > 0 ? g.asistidos : ""}</span>
                      <div style={{ width: "100%", maxWidth: 32, height: `${Math.max(h, 2)}%`, background: g.asistidos > 0 ? "linear-gradient(180deg, #2563eb, #7c3aed)" : "rgba(51,65,85,0.3)", borderRadius: "4px 4px 0 0", transition: "height 0.5s ease", cursor: "pointer" }} onClick={() => { setMonth(mi); setView("general"); }} />
                      <span style={{ fontSize: 9, color: "#64748b" }}>{m.slice(0, 3)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ====== MODAL: Gestión de equipo ====== */}
      {showKinesPanel && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setShowKinesPanel(false)}>
          <div style={{ background: "#0f172a", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 16, padding: 24, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>⚙ Gestión del equipo</h2>
              <button onClick={() => setShowKinesPanel(false)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 20, cursor: "pointer" }}>×</button>
            </div>

            {/* Lista de kines actuales */}
            <h3 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Kinesiólogos actuales</h3>
            <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {kines.map(k => (
                <div key={k.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(30,41,59,0.6)", border: `1px solid ${k.color}33` }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: k.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: k.color }}>{k.name}</span>
                  </div>
                  {confirmDeleteId === k.id ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => deleteKine(k.id)} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, background: "rgba(220,38,38,0.3)", border: "1px solid #dc2626", color: "#f87171", cursor: "pointer" }}>Confirmar</button>
                      <button onClick={() => setConfirmDeleteId(null)} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, background: "rgba(51,65,85,0.4)", border: "1px solid #334155", color: "#94a3b8", cursor: "pointer" }}>Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(k.id)} disabled={kines.length <= 1} style={{ padding: "4px 8px", borderRadius: 6, fontSize: 12, background: "none", border: "1px solid rgba(248,113,113,0.2)", color: kines.length <= 1 ? "#334155" : "#f87171", cursor: kines.length <= 1 ? "not-allowed" : "pointer" }}>
                      Eliminar
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Formulario para agregar */}
            <div style={{ borderTop: "1px solid rgba(148,163,184,0.1)", paddingTop: 20 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Agregar kinesiólogo</h3>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>Nombre</label>
                <input value={newKineName} onChange={e => setNewKineName(e.target.value)} placeholder="Nombre completo o apodo" onKeyDown={e => e.key === "Enter" && addKine()} style={{ ...inputStyle, width: "100%", maxWidth: "none", textAlign: "left", padding: "8px 12px" }} />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 6 }}>Color</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {COLOR_OPTIONS.map(c => (
                    <button key={c} onClick={() => setNewKineColor(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: newKineColor === c ? "3px solid white" : "2px solid transparent", cursor: "pointer", boxShadow: newKineColor === c ? `0 0 0 2px ${c}` : "none" }} />
                  ))}
                </div>
              </div>

              <button onClick={addKine} disabled={!newKineName.trim()} style={{ width: "100%", padding: "10px 0", borderRadius: 10, fontSize: 14, fontWeight: 700, background: !newKineName.trim() ? "rgba(37,99,235,0.1)" : "rgba(37,99,235,0.25)", border: "1px solid", borderColor: !newKineName.trim() ? "#1e3a5f" : "#2563eb", color: !newKineName.trim() ? "#334155" : "#60a5fa", cursor: !newKineName.trim() ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                + Agregar al equipo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const thStyle = { textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid rgba(148,163,184,0.1)", fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap" };
const labelStyle = { padding: "10px 12px", fontSize: 13, fontWeight: 600, color: "#cbd5e1", borderBottom: "1px solid rgba(148,163,184,0.05)", whiteSpace: "nowrap" };
const cellStyle = { padding: "6px 8px", borderBottom: "1px solid rgba(148,163,184,0.05)", textAlign: "center" };
const monoCell = { ...cellStyle, fontFamily: "'Space Mono', monospace", fontSize: 13, color: "#e2e8f0" };
const inputStyle = { width: "100%", maxWidth: 72, padding: "6px 8px", background: "rgba(15,23,42,0.6)", border: "1px solid #334155", borderRadius: 6, color: "#e2e8f0", fontSize: 14, fontFamily: "'Space Mono', monospace", textAlign: "center", outline: "none" };
