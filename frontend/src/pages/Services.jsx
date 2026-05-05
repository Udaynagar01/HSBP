import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PublicNav from "../components/PublicNav";
import { T } from "../theme";

const CATEGORIES = ["All","Plumbing","Electrical","Cleaning","Carpentry","Painting","AC Repair","Other"];

function getCatIcon(cat) {
  return { Plumbing:"🔧", Electrical:"⚡", Cleaning:"🧹", Carpentry:"🪚", Painting:"🎨", "AC Repair":"❄️" }[cat] || "🛠️";
}

export default function Services() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/services").then((r) => { setServices(r.data); setFiltered(r.data); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let res = category === "All" ? services : services.filter((s) => s.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter((s) => s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || (s.description||"").toLowerCase().includes(q));
    }
    setFiltered(res);
  }, [category, search, services]);

  return (
    <div style={s.page}>
      <PublicNav />

      {/* Hero */}
      <div style={s.hero}>
        <h1 style={s.heroTitle}>Find a Service</h1>
        <p style={s.heroSub}>Browse trusted local professionals and book instantly</p>
        <div style={s.searchBox}>
          <span style={s.searchIcon}>🔍</span>
          <input style={s.searchInput} placeholder="Search services..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button style={s.clearBtn} onClick={() => setSearch("")}>✕</button>}
        </div>
      </div>

      <div style={s.body}>
        {/* Filter chips */}
        <div style={s.filterRow}>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              style={{ ...s.chip, ...(category === cat ? s.chipActive : {}) }}>
              {cat}
            </button>
          ))}
        </div>

        <div style={s.resultsBar}>
          {!loading && (
            <span style={s.resultText}>
              {filtered.length} service{filtered.length !== 1 ? "s" : ""}
              {search ? ` for "${search}"` : ""}
              {category !== "All" ? ` · ${category}` : ""}
            </span>
          )}
        </div>

        {loading ? (
          <div style={s.loading}>Loading services...</div>
        ) : filtered.length === 0 ? (
          <div style={s.emptyCard}>
            <div style={s.emptyIcon}>🔍</div>
            <h3 style={s.emptyTitle}>No services found</h3>
            <p style={s.emptyText}>Try a different search or category.</p>
            <button style={s.resetBtn} onClick={() => { setSearch(""); setCategory("All"); }}>Clear Filters</button>
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map((sv) => (
              <div key={sv._id} style={s.card}>
                <div style={s.cardHeader}>
                  <div style={s.iconBox}>{getCatIcon(sv.category)}</div>
                  <span style={s.catBadge}>{sv.category}</span>
                </div>
                <h3 style={s.cardTitle}>{sv.title}</h3>
                <p style={s.cardDesc}>{sv.description || "Professional service at your doorstep."}</p>
                <div style={s.cardFooter}>
                  <div>
                    <div style={s.price}>₹{sv.price}</div>
                    <div style={s.providerName}>by {sv.provider?.name}</div>
                  </div>
                  {user?.role === "user" && (
                    <button style={s.bookBtn} onClick={() => navigate(`/book/${sv._id}`)}>Book Now</button>
                  )}
                  {!user && (
                    <button style={s.bookBtn} onClick={() => navigate("/login")}>Login to Book</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:"100vh", background:T.bg },
  hero: { background:`linear-gradient(135deg, ${T.sidebarBg}, #1e1b4b)`, padding:"56px 40px 44px", textAlign:"center" },
  heroTitle: { color:"#fff", fontSize:"2rem", fontWeight:"800", margin:"0 0 8px" },
  heroSub: { color:"#64748b", marginBottom:"24px" },
  searchBox: { position:"relative", maxWidth:"500px", margin:"0 auto", display:"flex", alignItems:"center" },
  searchIcon: { position:"absolute", left:"14px", fontSize:"1rem", pointerEvents:"none" },
  searchInput: { width:"100%", padding:"13px 44px 13px 42px", borderRadius:"10px", border:"none", fontSize:"0.95rem", outline:"none", boxSizing:"border-box", background:"rgba(255,255,255,0.95)" },
  clearBtn: { position:"absolute", right:"12px", background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:"0.95rem" },
  body: { padding:"24px 40px 40px", maxWidth:"1200px", margin:"0 auto" },
  filterRow: { display:"flex", flexWrap:"wrap", gap:"8px", marginBottom:"16px" },
  chip: { padding:"7px 16px", borderRadius:"20px", border:`1px solid ${T.border}`, background:T.cardBg, cursor:"pointer", fontSize:"0.83rem", fontWeight:"500", color:T.textMuted },
  chipActive: { background:T.primary, color:"#fff", border:`1px solid ${T.primary}` },
  resultsBar: { marginBottom:"16px" },
  resultText: { color:T.textMuted, fontSize:"0.87rem" },
  loading: { textAlign:"center", padding:"60px", color:T.textMuted },
  emptyCard: { background:T.cardBg, borderRadius:T.radiusLg, padding:"60px 32px", textAlign:"center", boxShadow:T.shadow },
  emptyIcon: { fontSize:"3rem", marginBottom:"14px" },
  emptyTitle: { color:T.text, fontSize:"1.1rem", marginBottom:"8px" },
  emptyText: { color:T.textMuted, fontSize:"0.9rem", marginBottom:"18px" },
  resetBtn: { padding:"10px 22px", background:T.primary, color:"#fff", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"600" },
  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(270px, 1fr))", gap:"18px" },
  card: { background:T.cardBg, borderRadius:T.radiusLg, padding:"20px", boxShadow:T.shadow, display:"flex", flexDirection:"column", gap:"10px" },
  cardHeader: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  iconBox: { width:"42px", height:"42px", borderRadius:"10px", background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem" },
  catBadge: { background:T.primaryLight, color:T.primary, borderRadius:"12px", padding:"3px 10px", fontSize:"0.75rem", fontWeight:"600" },
  cardTitle: { fontWeight:"700", color:T.text, fontSize:"1rem", margin:0 },
  cardDesc: { color:T.textMuted, fontSize:"0.83rem", flexGrow:1, lineHeight:1.5 },
  cardFooter: { display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:"4px" },
  price: { fontWeight:"800", color:T.primary, fontSize:"1.2rem" },
  providerName: { color:T.textMuted, fontSize:"0.78rem" },
  bookBtn: { padding:"9px 18px", background:T.primary, color:"#fff", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"600", fontSize:"0.88rem" },
};
