import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════ */
const SHOPS = [
  { id: 1, name: "Highway Pro Services", distance: 1.2, rating: 4.9, jobs: 1247, arrivalTime: 12, rate: 98, available: true, driver: "Mike Okonkwo", driverPhoto: "MO", truck: "White Ford F-450 #ST-01" },
  { id: 2, name: "RoadMaster Station 7", distance: 2.8, rating: 4.7, jobs: 892, arrivalTime: 18, rate: 96, available: true, driver: "Priya Nair", driverPhoto: "PN", truck: "Yellow Tow Truck #ST-07" },
  { id: 3, name: "QuickFix Automotive", distance: 4.1, rating: 4.8, jobs: 2103, arrivalTime: 24, rate: 99, available: true, driver: "James Otieno", driverPhoto: "JO", truck: "Red Van #ST-12" },
  { id: 4, name: "SwiftStop Express", distance: 6.2, rating: 4.5, jobs: 445, arrivalTime: 38, rate: 92, available: true, driver: "Sarah Mwangi", driverPhoto: "SM", truck: "Blue Pickup #ST-19" },
];

const SERVICES = [
  { id: "towing",    name: "Towing",          icon: "🚛", base: 75,  desc: "+$5/mile" },
  { id: "battery",  name: "Battery Service",  icon: "🔋", base: 120, desc: "Jump or replace" },
  { id: "tire",     name: "Tire Change",      icon: "🔧", base: 65,  desc: "Spare install" },
  { id: "fuel",     name: "Fuel Delivery",    icon: "⛽", base: 45,  desc: "+$3/mile" },
  { id: "lockout",  name: "Lockout Service",  icon: "🔑", base: 85,  desc: "Safe unlock" },
  { id: "mechanic", name: "Mobile Mechanic",  icon: "🔩", base: 150, desc: "On-site repair" },
];

const SUPERMARKET = [
  { id: "coffee",   name: "Hot Coffee",       price: 3.50,  emoji: "☕" },
  { id: "water",    name: "Water x2",         price: 2.00,  emoji: "💧" },
  { id: "burger",   name: "Burger Meal",      price: 8.99,  emoji: "🍔" },
  { id: "energy",   name: "Energy Drink",     price: 3.00,  emoji: "⚡" },
  { id: "fuel_can", name: "Fuel Can 1L",      price: 12.00, emoji: "🛢️" },
  { id: "charger",  name: "Phone Charger",    price: 15.00, emoji: "🔌" },
  { id: "blanket",  name: "Emergency Blanket",price: 8.00,  emoji: "🛡️" },
  { id: "snack",    name: "Snack Pack",       price: 4.50,  emoji: "🍿" },
];

/* ═══════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════ */
const C = {
  bg:          "#070707",
  surface:     "#101010",
  elevated:    "#181818",
  border:      "#252525",
  orange:      "#FF6200",
  orangeGlow:  "#FF620044",
  red:         "#FF3B3B",
  green:       "#00D16C",
  blue:        "#4FC3F7",
  text:        "#F2F2F2",
  muted:       "#808080",
  dim:         "#3A3A3A",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=DM+Mono:wght@400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.dim}; border-radius: 2px; }
  @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes spin   { to{transform:rotate(360deg)} }
  @keyframes ping   { 0%{transform:scale(1);opacity:1} 75%,100%{transform:scale(2);opacity:0} }
  @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
  .fu  { animation: fadeUp  0.45s ease forwards; }
  .fi  { animation: fadeIn  0.35s ease forwards; }
  .su  { animation: slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
  input,textarea { outline:none; font-family:'DM Sans',sans-serif; }
  button { cursor:pointer; border:none; font-family:'DM Sans',sans-serif; }
`;

/* ═══════════════════════════════════════════════
   PRIMITIVES
═══════════════════════════════════════════════ */
const font = {
  display: "'Barlow Condensed', sans-serif",
  mono:    "'DM Mono', monospace",
  body:    "'DM Sans', sans-serif",
};

const Btn = ({ children, onClick, variant = "primary", size = "md", full, disabled, style: s = {} }) => {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    fontFamily: font.display, fontWeight: 700, letterSpacing: "0.08em",
    textTransform: "uppercase", cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.18s ease", borderRadius: 5, opacity: disabled ? 0.45 : 1,
    width: full ? "100%" : "auto",
  };
  const sizes = {
    xs: { padding: "6px 12px",  fontSize: 12 },
    sm: { padding: "8px 16px",  fontSize: 13 },
    md: { padding: "12px 24px", fontSize: 15 },
    lg: { padding: "15px 28px", fontSize: 17 },
    xl: { padding: "18px 36px", fontSize: 20 },
  };
  const variants = {
    primary: { background: C.orange, color: "#fff",    border: "none" },
    ghost:   { background: "transparent", color: C.orange, border: `1.5px solid ${C.orange}` },
    dark:    { background: C.elevated, color: C.text,  border: `1px solid ${C.border}` },
    danger:  { background: C.red,    color: "#fff",    border: "none" },
    green:   { background: C.green,  color: "#000",    border: "none" },
  };
  return (
    <button onClick={!disabled ? onClick : undefined}
      style={{ ...base, ...sizes[size], ...variants[variant], ...s }}>
      {children}
    </button>
  );
};

const Field = ({ label, placeholder, value, onChange, type = "text", required }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && (
      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted }}>
        {label}{required && <span style={{ color: C.orange }}> *</span>}
      </label>
    )}
    <input type={type} placeholder={placeholder} value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 5,
        padding: "11px 14px", color: C.text, fontSize: 14, width: "100%",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onFocus={e => { e.target.style.borderColor = C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orangeGlow}`; }}
      onBlur={e =>  { e.target.style.borderColor = C.border;  e.target.style.boxShadow = "none"; }}
    />
  </div>
);

const Card = ({ children, style: s = {}, glow }) => (
  <div style={{
    background: C.surface, border: `1px solid ${glow ? C.orange + "55" : C.border}`,
    borderRadius: 10, padding: 18,
    boxShadow: glow ? `0 0 20px ${C.orangeGlow}` : "none",
    ...s,
  }}>{children}</div>
);

const Tag = ({ children, color = C.orange }) => (
  <span style={{
    background: `${color}18`, color, border: `1px solid ${color}40`,
    padding: "3px 9px", borderRadius: 3,
    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
  }}>{children}</span>
);

const Divider = ({ style: s = {} }) => (
  <div style={{ height: 1, background: C.border, margin: "14px 0", ...s }} />
);

const MonoNum = ({ children, size = 24, color = C.orange }) => (
  <span style={{ fontFamily: font.mono, fontSize: size, color, fontWeight: 500 }}>{children}</span>
);

const TopBar = ({ title, sub }) => (
  <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "13px 20px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontFamily: font.display, fontSize: 21, fontWeight: 900, color: C.orange, letterSpacing: "0.12em" }}>
        SWIFTTOR
      </span>
      {title && <>
        <span style={{ color: C.dim }}>›</span>
        <span style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>{title}</span>
      </>}
      {sub && <span style={{ fontSize: 12, color: C.dim, marginLeft: "auto" }}>{sub}</span>}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   SCREEN 1 — LANDING
═══════════════════════════════════════════════ */
const Landing = ({ onStart }) => {
  const [rescued,  setRescued]  = useState(147);
  const [online,   setOnline]   = useState(38);
  const [ticker,   setTicker]   = useState(0);

  const TICKER_ITEMS = [
    { name: "Alex M.",   service: "Battery Replaced",   loc: "Hwy 10",    time: "2m ago" },
    { name: "Diana K.",  service: "Tire Changed",        loc: "Mombasa Rd",time: "5m ago" },
    { name: "James O.",  service: "Towed to Station",    loc: "Ngong Rd",  time: "9m ago" },
    { name: "Fatuma A.", service: "Fuel Delivered",      loc: "Thika Rd",  time: "14m ago"},
    { name: "Brian N.",  service: "Lockout Resolved",    loc: "Waiyaki Way",time: "18m ago"},
  ];

  useEffect(() => {
    const a = setInterval(() => setRescued(c => c + Math.floor(Math.random() * 2)), 4000);
    const b = setInterval(() => setTicker(t => (t + 1) % TICKER_ITEMS.length), 3500);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);

  const tick = TICKER_ITEMS[ticker];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, overflowX: "hidden" }} className="fu">
      {/* Nav */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "13px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: font.display, fontSize: 24, fontWeight: 900, color: C.orange, letterSpacing: "0.15em" }}>SWIFTTOR</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative", width: 8, height: 8 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.green, animation: "ping 1.5s infinite" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.green }} />
          </div>
          <span style={{ fontSize: 12, color: C.muted }}>{online} drivers live</span>
        </div>
      </div>

      {/* Ticker */}
      <div style={{ background: C.elevated, borderBottom: `1px solid ${C.border}`, padding: "8px 20px", display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
        <Tag color={C.green}>LIVE</Tag>
        <span style={{ fontSize: 12, color: C.muted }} key={ticker} className="fi">
          <b style={{ color: C.text }}>{tick.name}</b> — {tick.service} · {tick.loc} · <span style={{ color: C.green }}>{tick.time}</span>
        </span>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px" }}>
        {/* Badge */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Tag color={C.red}>🚨 24/7 Emergency Roadside Assistance</Tag>
        </div>

        {/* Hero */}
        <h1 style={{ fontFamily: font.display, fontSize: 68, fontWeight: 900, lineHeight: 0.92, textAlign: "center", letterSpacing: "-0.02em", marginBottom: 16 }}>
          STRANDED?<br /><span style={{ color: C.orange }}>WE'RE<br />COMING.</span>
        </h1>
        <p style={{ textAlign: "center", color: C.muted, fontSize: 15, lineHeight: 1.65, marginBottom: 32 }}>
          Real verified drivers. Real-time tracking. Help in minutes — not hours.
        </p>

        {/* Live stats */}
        <Card style={{ marginBottom: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
            {[
              { label: "Rescued Today", val: rescued },
              { label: "Avg Response",  val: "18m" },
              { label: "Completion",    val: "98%" },
            ].map(({ label, val }) => (
              <div key={label} style={{ textAlign: "center", padding: "8px 0" }}>
                <MonoNum size={28}>{val}</MonoNum>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA */}
        <Btn onClick={onStart} size="xl" full style={{ marginBottom: 12, fontSize: 22 }}>
          🚨 I'm Stranded — Get Help Now
        </Btn>
        <p style={{ textAlign: "center", fontSize: 11, color: C.dim, marginBottom: 32 }}>
          Payment held in escrow · Released only after job completion
        </p>

        {/* Trust grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 32 }}>
          {[
            ["✅ Verified Shops",     "Every station licensed & insured"],
            ["🔒 Secure Escrow",      "Money released on completion"],
            ["⭐ 4.8 Avg Rating",     "From 15,000+ real customers"],
            ["📍 GPS Tracking",       "Watch your driver in real-time"],
          ].map(([title, sub]) => (
            <div key={title} style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{title}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: C.dim, marginBottom: 14 }}>How It Works</div>
        {[
          ["01", "Report your location & problem", "30 sec"],
          ["02", "Choose a service or talk to AI",  "1 min"],
          ["03", "Pick a driver, pay securely",     "1 min"],
          ["04", "Watch driver arrive in real-time","Done"],
        ].map(([n, t, d]) => (
          <div key={n} style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 14 }}>
            <span style={{ fontFamily: font.mono, fontSize: 12, color: C.orange, marginTop: 1 }}>{n}</span>
            <span style={{ fontSize: 13, color: C.muted, flex: 1 }}>{t}</span>
            <span style={{ fontSize: 11, color: C.dim }}>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SCREEN 2 — INTAKE FORM
═══════════════════════════════════════════════ */
const IntakeForm = ({ onComplete }) => {
  const [step, setStep]   = useState(1);
  const [data, setData]   = useState({
    name: "", phone: "", location: "", landmark: "", vehicle: "",
    issue: [], image: null, imagePreview: null,
  });
  const fileRef = useRef();

  const ISSUES = ["Won't Start","Flat Tire","Overheating","Out of Gas","Locked Out","Accident","Noise/Vibration","Other"];
  const toggle = (i) => setData(d => ({ ...d, issue: d.issue.includes(i) ? d.issue.filter(x => x !== i) : [...d.issue, i] }));
  const set    = (k) => (v) => setData(d => ({ ...d, [k]: v }));

  const severity = data.issue.includes("Accident") || data.issue.length >= 3 ? "red" : data.issue.length >= 1 ? "yellow" : null;

  const handleImg = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => setData(d => ({ ...d, image: f, imagePreview: ev.target.result }));
    r.readAsDataURL(f);
  };

  const ok1 = data.name && data.phone && data.location;
  const ok2 = data.issue.length > 0;

  return (
    <div style={{ minHeight: "100vh", background: C.bg }} className="fu">
      <TopBar title="Emergency Report" />

      {/* Progress */}
      <div style={{ display: "flex", gap: 4, padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
        {[1, 2].map(s => (
          <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= s ? C.orange : C.dim, transition: "background 0.3s" }} />
        ))}
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "28px 20px" }}>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="fu">
            <h2 style={{ fontFamily: font.display, fontSize: 38, fontWeight: 800, marginBottom: 6 }}>YOUR DETAILS</h2>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 24 }}>Tell us who you are and where you're stranded.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Full Name"              placeholder="e.g. Alex Johnson"                        value={data.name}     onChange={set("name")}     required />
              <Field label="Phone Number"           placeholder="+254 7XX XXX XXX"                        value={data.phone}    onChange={set("phone")}    required />
              <Field label="Your Location"          placeholder="e.g. Mombasa Road, near Total station"   value={data.location} onChange={set("location")} required />
              <Field label="Landmark / Marker"      placeholder="e.g. Near milestone 30, under overpass"  value={data.landmark} onChange={set("landmark")} />
              <Field label="Vehicle (Year/Make/Color/Plate)" placeholder="e.g. 2019 Toyota Corolla White KCB 234A" value={data.vehicle}  onChange={set("vehicle")}  />
            </div>
            <Btn onClick={() => setStep(2)} size="lg" full style={{ marginTop: 28 }} disabled={!ok1}>
              Continue →
            </Btn>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="fu">
            <h2 style={{ fontFamily: font.display, fontSize: 38, fontWeight: 800, marginBottom: 6 }}>WHAT'S WRONG?</h2>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Select everything that applies. Be specific — it helps us dispatch faster.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {ISSUES.map(issue => {
                const sel = data.issue.includes(issue);
                return (
                  <button key={issue} onClick={() => toggle(issue)} style={{
                    padding: "12px 10px", borderRadius: 7,
                    border: `1.5px solid ${sel ? C.orange : C.border}`,
                    background: sel ? `${C.orange}14` : C.elevated,
                    color: sel ? C.orange : C.text,
                    fontSize: 13, fontWeight: 500, textAlign: "left", cursor: "pointer", transition: "all 0.15s",
                  }}>{issue}</button>
                );
              })}
            </div>

            {severity && (
              <div style={{ padding: "11px 14px", borderRadius: 6, marginBottom: 16,
                background: `${severity === "red" ? C.red : C.orange}14`,
                border: `1px solid ${severity === "red" ? C.red : C.orange}44`,
              }}>
                <span style={{ fontSize: 13, color: severity === "red" ? C.red : C.orange }}>
                  {severity === "red" ? "⚠️ High severity — Priority dispatch active" : "🟡 Standard severity — Dispatching nearest driver"}
                </span>
              </div>
            )}

            {/* Image upload */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>
                Photo of Problem <span style={{ color: C.dim }}>(Optional — helps AI diagnose faster)</span>
              </div>
              <div
                onClick={() => fileRef.current.click()}
                style={{ border: `2px dashed ${C.border}`, borderRadius: 8, padding: 20, textAlign: "center", cursor: "pointer", minHeight: 90, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.orange}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
              >
                {data.imagePreview
                  ? <img src={data.imagePreview} alt="issue" style={{ maxHeight: 130, borderRadius: 6, objectFit: "cover" }} />
                  : <><span style={{ fontSize: 30 }}>📸</span><span style={{ color: C.muted, fontSize: 13 }}>Tap to upload a photo</span></>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImg} style={{ display: "none" }} />
            </div>

            {/* Path choice */}
            <div style={{ marginBottom: 10, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.muted }}>How would you like to proceed?</div>
            <Btn onClick={() => onComplete({ ...data, path: "alpha" })} size="lg" full style={{ marginBottom: 10 }} disabled={!ok2}>
              🗺️ Browse Services Myself
            </Btn>
            <Btn onClick={() => onComplete({ ...data, path: "beta" })} size="lg" full variant="ghost" disabled={!ok2}>
              💬 Talk to AI Assistant
            </Btn>

            <button onClick={() => setStep(1)} style={{ background: "none", color: C.muted, fontSize: 13, marginTop: 14, width: "100%", textDecoration: "underline", cursor: "pointer" }}>
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SCREEN 3A — SERVICE MAP (PATH ALPHA)
═══════════════════════════════════════════════ */
const ServiceMap = ({ intake, onSelectShop }) => {
  const [sort,     setSort]     = useState("recommended");
  const [selected, setSelected] = useState(null);

  const sorted = SHOPS.map(s => ({
    ...s,
    score: (1 / s.distance) * 0.4 + s.rating * 0.3 + (s.rate / 100) * 0.2 - (s.arrivalTime / 100) * 0.1,
  })).sort((a, b) => {
    if (sort === "nearest")  return a.distance - b.distance;
    if (sort === "fastest")  return a.arrivalTime - b.arrivalTime;
    if (sort === "rated")    return b.rating - a.rating;
    return b.score - a.score;
  });

  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <TopBar title="Nearby Shops" sub={`📍 ${intake.location}`} />

      {/* Simulated map */}
      <div style={{ height: 170, background: "#0C1018", position: "relative", overflow: "hidden", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(#1C2333 1px, transparent 1px)", backgroundSize: "28px 28px", opacity: 0.6 }} />
        {/* Roads */}
        <div style={{ position: "absolute", left: 0, right: 0, top: "48%", height: 2, background: C.dim, opacity: 0.5 }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "45%", width: 2, background: C.dim, opacity: 0.5 }} />
        {/* User dot */}
        <div style={{ position: "absolute", left: "45%", top: "48%", transform: "translate(-50%,-50%)" }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.blue, border: "2.5px solid #fff", zIndex: 2, position: "relative" }} />
          <div style={{ position: "absolute", inset: -6, borderRadius: "50%", background: C.blue + "33", animation: "ping 2s infinite" }} />
        </div>
        {/* Shop pins */}
        {sorted.map((s, i) => (
          <div key={s.id}
            onClick={() => setSelected(s)}
            style={{ position: "absolute", left: `${12 + i * 20}%`, top: `${20 + (i % 2) * 40}%`, cursor: "pointer", zIndex: 3 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: selected?.id === s.id ? "#fff" : C.orange,
              color: selected?.id === s.id ? C.orange : "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, fontFamily: font.display,
              border: `2.5px solid ${C.bg}`,
              boxShadow: `0 0 14px ${C.orangeGlow}`,
              transition: "all 0.2s",
            }}>{i + 1}</div>
          </div>
        ))}
        <div style={{ position: "absolute", bottom: 8, right: 10, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: "3px 8px", fontSize: 10, color: C.muted }}>Map view</div>
      </div>

      {/* Sort tabs */}
      <div style={{ display: "flex", gap: 6, padding: "10px 16px", borderBottom: `1px solid ${C.border}`, overflowX: "auto" }}>
        {[["recommended","⭐ Best Match"],["nearest","📍 Nearest"],["fastest","⚡ Fastest"],["rated","🏆 Top Rated"]].map(([k, l]) => (
          <button key={k} onClick={() => setSort(k)} style={{
            padding: "6px 12px", borderRadius: 20, whiteSpace: "nowrap", cursor: "pointer", fontSize: 12,
            border: `1px solid ${sort === k ? C.orange : C.border}`,
            background: sort === k ? `${C.orange}18` : C.elevated,
            color: sort === k ? C.orange : C.muted,
            transition: "all 0.15s",
          }}>{l}</button>
        ))}
      </div>

      {/* Shop list */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 14 }}>
        {sorted.map((shop, i) => (
          <div key={shop.id} onClick={() => setSelected(shop)} style={{
            background: C.surface, borderRadius: 9, padding: "14px 16px", marginBottom: 10,
            border: `1.5px solid ${selected?.id === shop.id ? C.orange : C.border}`,
            cursor: "pointer", transition: "all 0.15s",
            boxShadow: selected?.id === shop.id ? `0 0 18px ${C.orangeGlow}` : "none",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: font.display, fontSize: 19, fontWeight: 800 }}>{shop.name}</span>
                  {i === 0 && <Tag>Best</Tag>}
                </div>
                <div style={{ display: "flex", gap: 14, fontSize: 12, color: C.muted }}>
                  <span>⭐ {shop.rating}  ({shop.jobs} jobs)</span>
                  <span>📍 {shop.distance} km</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <MonoNum size={26} color={C.green}>{shop.arrivalTime}m</MonoNum>
                <div style={{ fontSize: 10, color: C.muted }}>ETA</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: C.dim, overflow: "hidden" }}>
                <div style={{ width: `${shop.rate}%`, height: "100%", background: C.green, borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 11, color: C.muted }}>{shop.rate}% completion</span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <ShopDrawer shop={selected} onClose={() => setSelected(null)} onBook={onSelectShop} />
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SHOP DRAWER
═══════════════════════════════════════════════ */
const ShopDrawer = ({ shop, onClose, onBook }) => {
  const [selectedSvc, setSelectedSvc] = useState([]);
  const [cart,        setCart]        = useState([]);
  const [showMarket,  setShowMarket]  = useState(false);

  const toggleSvc  = (s) => setSelectedSvc(p => p.find(x => x.id === s.id) ? p.filter(x => x.id !== s.id) : [...p, s]);
  const toggleItem = (i) => setCart(p => p.find(x => x.id === i.id) ? p.filter(x => x.id !== i.id) : [...p, i]);

  const svcTotal  = selectedSvc.reduce((s, x) => s + x.base, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price, 0);
  const total     = svcTotal + cartTotal;
  const canBook   = selectedSvc.length > 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "flex-end" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "16px 16px 0 0", width: "100%", maxHeight: "88vh", overflowY: "auto" }} className="su">

        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
          <div style={{ width: 38, height: 4, background: C.dim, borderRadius: 2 }} />
        </div>

        <div style={{ padding: "0 18px 36px" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontFamily: font.display, fontSize: 26, fontWeight: 800, lineHeight: 1.1 }}>{shop.name}</div>
              <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>Driver: <b style={{ color: C.text }}>{shop.driver}</b></div>
            </div>
            <div style={{ textAlign: "center", background: C.elevated, borderRadius: 8, padding: "8px 14px" }}>
              <MonoNum size={30} color={C.green}>{shop.arrivalTime}m</MonoNum>
              <div style={{ fontSize: 9, color: C.muted, marginTop: 2, textTransform: "uppercase", letterSpacing: "0.1em" }}>ETA</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
            {[["⭐ " + shop.rating, "Rating"], [shop.jobs, "Jobs Done"], [shop.rate + "%", "Completion"]].map(([v, l]) => (
              <div key={l} style={{ background: C.elevated, borderRadius: 7, padding: "10px 6px", textAlign: "center" }}>
                <MonoNum size={20}>{v}</MonoNum>
                <div style={{ fontSize: 9, color: C.muted, marginTop: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Services */}
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: C.muted, marginBottom: 10 }}>Select Services</div>
          {SERVICES.map(svc => {
            const sel = selectedSvc.find(s => s.id === svc.id);
            return (
              <div key={svc.id} onClick={() => toggleSvc(svc)} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 14px", borderRadius: 7, marginBottom: 7, cursor: "pointer",
                border: `1.5px solid ${sel ? C.orange : C.border}`,
                background: sel ? `${C.orange}10` : C.elevated,
                transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 20 }}>{svc.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{svc.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{svc.desc}</div>
                  </div>
                </div>
              </div>
            );
          })}

          <Divider />

          {/* Supermarket toggle */}
          <button onClick={() => setShowMarket(!showMarket)} style={{
            width: "100%", padding: "12px 14px", background: C.elevated, border: `1px solid ${C.border}`,
            borderRadius: 7, color: C.text, fontSize: 14, cursor: "pointer",
            display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showMarket ? 12 : 0,
          }}>
            <span>🛒 While You Wait — Station Store</span>
            <span style={{ color: C.orange, fontFamily: font.mono, fontSize: 12 }}>{showMarket ? "▲ Hide" : "▼ Show"}</span>
          </button>

          {showMarket && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }} className="fi">
              {SUPERMARKET.map(item => {
                const inCart = cart.find(i => i.id === item.id);
                return (
                  <div key={item.id} onClick={() => toggleItem(item)} style={{
                    padding: 12, borderRadius: 7, textAlign: "center", cursor: "pointer",
                    border: `1.5px solid ${inCart ? C.orange : C.border}`,
                    background: inCart ? `${C.orange}10` : C.elevated, transition: "all 0.15s",
                  }}>
                    <div style={{ fontSize: 26, marginBottom: 4 }}>{item.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{item.name}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cart summary + Book */}
          {canBook && (
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, padding: 16, marginTop: 14 }} className="fi">

              <Btn full size="lg" onClick={() => {
                // Build WhatsApp message
                const svcNames = selectedSvc.map(s => s.name).join(', ');
                const message = encodeURIComponent(
                  `Hi! I'd like to book a driver.\n\n` +
                  `Driver: ${shop.driver}\n` +
                  `Company: ${shop.name}\n` +
                  `Services: ${svcNames}\n` +
                  `Location: [Your location]\n` +
                  `Please confirm availability and pricing.`
                );
                
                // Open WhatsApp with pre-filled message
                window.open(`https://wa.me/?text=${message}`, '_blank');
              }}>
                Book {shop.driver} →
              </Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SCREEN 3B — AI AGENT (PATH BETA)
═══════════════════════════════════════════════ */
const AIAgent = ({ intake, onComplete }) => {
  const firstName = intake.name?.split(" ")[0] || "there";
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `Hi ${firstName}! I'm your SwiftTor rescue assistant. I can see you're at ${intake.location || "your location"}${intake.issue?.length ? ` with a reported issue: ${intake.issue.join(", ")}` : ""}.\n\nFirst — are you in a safe spot away from traffic?`,
  }]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [quote,   setQuote]   = useState(null);
  const [matched, setMatched] = useState(null);
  const endRef = useRef();
  const inputRef = useRef();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are SwiftTor's AI Rescue Assistant — professional, calm, urgent. You help stranded drivers get roadside assistance.

CUSTOMER:
- Name: ${intake.name}
- Location: ${intake.location}
- Reported issues: ${intake.issue?.join(", ") || "Unknown"}
- Vehicle: ${intake.vehicle || "Not specified"}

PRICING:
- Towing: $75 base + $5/mile
- Battery Service (jump or replace): $120
- Tire Change: $65
- Fuel Delivery: $45 + $3/mile
- Lockout Service: $85
- Mobile Mechanic: $150
- Platform service fee: $25 (always add)
- Tax: 16%

YOUR TASK:
1. Ask 1-2 focused diagnostic questions to pinpoint the problem
2. Recommend the right service(s) based on their answers
3. Once you have enough info, output a quote in EXACTLY this format (important — the dashes must be exact):

---QUOTE---
Service: [service name(s)]
Parts/Labor: [description] — $[amount]
Platform Fee: $25
Subtotal: $[amount]
Tax (16%): $[amount]
TOTAL: $[amount]
---END QUOTE---

4. After the quote, say: "I've matched you with the best available driver. Tap the button below to view their profile and confirm your booking."

Rules:
- Be concise — max 3-4 sentences before quote
- Always use customer's first name (${firstName})
- Confirm safety in first response only
- Be warm but efficient — this is an emergency`,
          messages: history.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const text = data.content?.[0]?.text || "I'm having trouble connecting right now. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: text }]);

      if (text.includes("---QUOTE---")) {
        const match = text.match(/---QUOTE---([\s\S]*?)---END QUOTE---/);
        if (match) {
          setQuote(match[1].trim());
          setMatched(SHOPS[0]);
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection issue — please try again or call our emergency line." }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const totalFromQuote = quote ? parseFloat(quote.match(/TOTAL: \$([0-9.]+)/)?.[1] || 0) : 0;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }} className="fu">
      {/* Header */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⚡</div>
        <div>
          <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 800, letterSpacing: "0.06em" }}>SWIFTTOR AI ASSISTANT</div>
          <div style={{ fontSize: 11, color: C.green }}>● Online — Ready to help</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8 }}>
            {m.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 2 }}>⚡</div>
            )}
            <div style={{
              maxWidth: "82%", padding: "11px 15px", lineHeight: 1.55, fontSize: 14, whiteSpace: "pre-wrap",
              borderRadius: m.role === "user" ? "14px 3px 14px 14px" : "3px 14px 14px 14px",
              background: m.role === "user" ? C.orange : C.elevated,
              color: C.text,
            }}>{m.content}</div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>⚡</div>
            <div style={{ display: "flex", gap: 5, padding: "12px 16px", background: C.elevated, borderRadius: "3px 14px 14px 14px" }}>
              {[0, 1, 2].map(j => <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: C.muted, animation: `pulse 1.2s ${j * 0.25}s infinite` }} />)}
            </div>
          </div>
        )}

        {/* Quote card */}
        {quote && matched && (
          <div style={{ background: C.surface, border: `1.5px solid ${C.orange}55`, borderRadius: 12, padding: 18, marginTop: 6 }} className="fu">
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: C.orange, marginBottom: 10 }}>📋 Your Rescue Quote</div>
            <pre style={{ fontFamily: font.mono, fontSize: 12.5, color: C.text, whiteSpace: "pre-wrap", lineHeight: 1.7, marginBottom: 16 }}>{quote}</pre>
            <Divider />
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: C.muted, marginBottom: 10 }}>Best Driver Match</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.display, fontSize: 16, fontWeight: 700 }}>{matched.driverPhoto}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{matched.driver}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>⭐ {matched.rating} · {matched.arrivalTime} mins away · {matched.jobs} jobs</div>
                  <div style={{ fontSize: 11, color: C.dim }}>{matched.name}</div>
                </div>
              </div>
            </div>
            <Btn full size="lg" onClick={() => onComplete({ shop: matched, services: [], cart: [], total: totalFromQuote, quote })}>
              View Profile & Confirm Booking →
            </Btn>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <div style={{ padding: "10px 14px", background: C.surface, borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Describe what happened…"
            style={{ flex: 1, background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 14px", color: C.text, fontSize: 14 }}
          />
          <Btn onClick={send} disabled={loading || !input.trim()} size="md">Send</Btn>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SCREEN 4 — CHECKOUT
═══════════════════════════════════════════════ */
const Checkout = ({ order, intake, onConfirm }) => {
  const [method,     setMethod]     = useState("card");
  const [processing, setProcessing] = useState(false);
  const [cardNum,    setCardNum]    = useState("");
  const [cardExp,    setCardExp]    = useState("");
  const [cardCvc,    setCardCvc]    = useState("");

  const services  = order.services || [];
  const cart      = order.cart     || [];
  const subtotal  = order.total    || 0;
  const tax       = subtotal * 0.16;
  const platform  = 25;
  const grand     = subtotal + tax + platform;

  const pay = () => {
    setProcessing(true);
    setTimeout(() => { setProcessing(false); onConfirm(); }, 2200);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg }} className="fu">
      <TopBar title="Checkout" />
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "22px 16px" }}>

        {/* Order summary */}
        <Card style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: C.muted, marginBottom: 12 }}>Order Summary</div>

          {/* Driver */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.display, fontSize: 16, fontWeight: 700 }}>{order.shop?.driverPhoto}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{order.shop?.driver}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{order.shop?.name}</div>
            </div>
            <Tag color={C.green}>ETA {order.shop?.arrivalTime}m</Tag>
          </div>

          <Divider style={{ margin: "10px 0" }} />

          {services.map(s => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 14, borderBottom: `1px solid ${C.border}` }}>
              <span>{s.icon} {s.name}</span><MonoNum size={14} color={C.text}>${s.base}</MonoNum>
            </div>
          ))}
          {cart.map(i => (
            <div key={i.id} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 14, borderBottom: `1px solid ${C.border}` }}>
              <span>{i.emoji} {i.name}</span><MonoNum size={14} color={C.text}>${i.price.toFixed(2)}</MonoNum>
            </div>
          ))}
          {order.quote && (
            <div style={{ padding: "7px 0", fontSize: 12, color: C.muted, borderBottom: `1px solid ${C.border}` }}>
              AI-generated quote applied
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            {[["Subtotal", `$${subtotal.toFixed(2)}`], ["Tax (16%)", `$${tax.toFixed(2)}`], ["Platform Fee", `$${platform.toFixed(2)}`]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, marginBottom: 6 }}>
                <span>{k}</span><MonoNum size={13} color={C.muted}>{v}</MonoNum>
              </div>
            ))}
            <Divider style={{ margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 17 }}>Total</span>
              <MonoNum size={26} color={C.orange}>${grand.toFixed(2)}</MonoNum>
            </div>
          </div>
        </Card>

        {/* Payment method */}
        <Card style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: C.muted, marginBottom: 12 }}>Payment Method</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 16 }}>
            {[["card","💳 Card"],["paypal","🅿️ PayPal"],["mpesa","📱 M-Pesa"],["arrival","🤝 On Arrival"]].map(([k, l]) => (
              <button key={k} onClick={() => setMethod(k)} style={{
                padding: "10px 6px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 500,
                border: `1.5px solid ${method === k ? C.orange : C.border}`,
                background: method === k ? `${C.orange}18` : C.elevated,
                color: method === k ? C.orange : C.muted, transition: "all 0.15s",
              }}>{l}</button>
            ))}
          </div>

          {method === "card" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="fi">
              <Field label="Card Number" placeholder="4242 4242 4242 4242" value={cardNum} onChange={setCardNum} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Expiry"  placeholder="MM/YY" value={cardExp} onChange={setCardExp} />
                <Field label="CVC"     placeholder="•••"   value={cardCvc} onChange={setCardCvc} />
              </div>
              <Field label="Name on Card" placeholder={intake?.name || "Cardholder name"} value="" onChange={() => {}} />
            </div>
          )}
          {method === "mpesa" && (
            <div className="fi">
              <Field label="M-Pesa Number" placeholder="+254 7XX XXX XXX" value="" onChange={() => {}} />
              <p style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>You'll receive a STK push to confirm. Check your phone.</p>
            </div>
          )}
          {method === "paypal" && (
            <div className="fi" style={{ textAlign: "center", padding: "16px 0", color: C.muted, fontSize: 13 }}>
              You'll be redirected to PayPal to complete payment securely.
            </div>
          )}
          {method === "arrival" && (
            <div className="fi" style={{ padding: "12px 14px", background: `${C.orange}10`, borderRadius: 7, fontSize: 13, color: C.muted }}>
              Your card is saved and charged <b style={{ color: C.text }}>only after the driver marks the job complete</b>. Cancellation after dispatch: $15 fee.
            </div>
          )}
        </Card>

        {/* Escrow notice */}
        <div style={{ textAlign: "center", fontSize: 11, color: C.dim, marginBottom: 18 }}>
          🔒 Payment held in secure escrow — released only after you confirm job completion
        </div>

        <Btn full size="xl" onClick={pay} disabled={processing}>
          {processing ? (
            <><div style={{ width: 16, height: 16, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} /> Processing…</>
          ) : `Confirm & Pay $${grand.toFixed(2)}`}
        </Btn>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   SCREEN 5 — CONFIRMATION
═══════════════════════════════════════════════ */
const Confirmation = ({ order }) => {
  const eta     = order.shop?.arrivalTime || 18;
  const [secs, setSecs] = useState(eta * 60);

  useEffect(() => {
    const iv = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(iv);
  }, []);

  const m = String(Math.floor(secs / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  const orderId = `ST-${Date.now().toString().slice(-8)}`;
  const firstName = order.intake?.name?.split(" ")[0] || "there";

  return (
    <div style={{ minHeight: "100vh", background: C.bg }} className="fu">
      <TopBar title="Confirmed" />
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "30px 16px", textAlign: "center" }}>

        {/* Success */}
        <div style={{ width: 76, height: 76, borderRadius: "50%", background: `${C.green}18`, border: `2px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", fontSize: 34 }}>✅</div>
        <h2 style={{ fontFamily: font.display, fontSize: 44, fontWeight: 900, color: C.green, marginBottom: 4 }}>BOOKING CONFIRMED</h2>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 2 }}>Order #{orderId}</div>
        <div style={{ color: C.muted, fontSize: 13, marginBottom: 30 }}>Help is on the way, {firstName}. Stay safe.</div>

        {/* Countdown */}
        <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 12, padding: "24px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: C.muted, marginBottom: 10 }}>Driver Arrives In</div>
          <div style={{ fontFamily: font.mono, fontSize: 76, fontWeight: 500, color: secs < 60 ? C.green : C.orange, lineHeight: 1, transition: "color 0.5s" }}>
            {m}:{s}
          </div>
          <div style={{ fontSize: 11, color: C.dim, marginTop: 8 }}>Updated in real-time · Traffic-aware ETA</div>
          {/* Progress bar */}
          <div style={{ height: 4, background: C.dim, borderRadius: 2, marginTop: 16, overflow: "hidden" }}>
            <div style={{ width: `${((eta * 60 - secs) / (eta * 60)) * 100}%`, height: "100%", background: C.orange, borderRadius: 2, transition: "width 1s linear" }} />
          </div>
        </div>

        {/* Driver card */}
        <Card style={{ textAlign: "left", marginBottom: 14 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: C.muted, marginBottom: 12 }}>Your Driver</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.orange, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: font.display, fontSize: 20, fontWeight: 700 }}>{order.shop?.driverPhoto}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>{order.shop?.driver}</div>
              <div style={{ color: C.muted, fontSize: 12 }}>{order.shop?.name}</div>
              <div style={{ color: C.muted, fontSize: 12 }}>⭐ {order.shop?.rating} · {order.shop?.truck}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[["📞 Call", "Driver"],["💬 Message","Chat"],["📍 Share","Track link"]].map(([icon, l]) => (
              <Btn key={l} size="sm" variant="dark" style={{ flexDirection: "column", gap: 2, padding: "8px 4px", fontSize: 12 }}>
                <span style={{ fontSize: 14 }}>{icon}</span><span>{l}</span>
              </Btn>
            ))}
          </div>
        </Card>

        {/* Safety tips */}
        <Card style={{ textAlign: "left" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: C.muted, marginBottom: 10 }}>⚠️ Stay Safe While You Wait</div>
          {["Stay in your vehicle with seatbelt on", "Turn on hazard / emergency lights", "Move as far from traffic as possible", "Call 999 immediately if you feel unsafe"].map(tip => (
            <div key={tip} style={{ display: "flex", gap: 10, fontSize: 13, marginBottom: 9, color: C.muted }}>
              <span style={{ color: C.orange, flexShrink: 0 }}>›</span>{tip}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════ */
export default function SwiftTor() {
  const [screen, setScreen] = useState("landing");
  const [intake, setIntake] = useState(null);
  const [order,  setOrder]  = useState({});

  const handleIntake    = (data)      => { setIntake(data); setScreen(data.path === "beta" ? "ai" : "map"); };
  const handleShopBook  = (orderData) => { setOrder(orderData); setScreen("checkout"); };
  const handleAIBook    = (orderData) => { setOrder(orderData); setScreen("checkout"); };
  const handleConfirm   = ()          => setScreen("confirmation");

  return (
    <div style={{ fontFamily: font.body, background: C.bg, color: C.text, maxWidth: 480, margin: "0 auto" }}>
      <style>{CSS}</style>
      {screen === "landing"      && <Landing     onStart={() => setScreen("intake")} />}
      {screen === "intake"       && <IntakeForm  onComplete={handleIntake} />}
      {screen === "map"          && <ServiceMap  intake={intake} onSelectShop={handleShopBook} />}
      {screen === "ai"           && <AIAgent     intake={intake} onComplete={handleAIBook} />}
      {screen === "checkout"     && <Checkout    order={order} intake={intake} onConfirm={handleConfirm} />}
      {screen === "confirmation" && <Confirmation order={{ ...order, intake }} />}
    </div>
  );
}
