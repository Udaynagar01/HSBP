import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { T } from "../theme";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", role:"user" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      login(data.token, data.user);
      if (data.user.role === "provider") navigate("/provider/bookings");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <Link to="/" style={s.brand}>🔧 HSBP</Link>
        <h1 style={s.heroText}>Join HSBP today</h1>
        <p style={s.heroSub}>Create an account as a customer or become a verified service provider.</p>
        <div style={s.roleCards}>
          <div style={{ ...s.roleCard, ...(form.role === "user" ? s.roleCardActive : {}) }}
            onClick={() => setForm({ ...form, role:"user" })}>
            <div style={s.roleIcon}>👤</div>
            <div style={s.roleLabel}>Customer</div>
            <div style={s.roleDesc}>Book services</div>
          </div>
          <div style={{ ...s.roleCard, ...(form.role === "provider" ? s.roleCardActive : {}) }}
            onClick={() => setForm({ ...form, role:"provider" })}>
            <div style={s.roleIcon}>🧑‍🔧</div>
            <div style={s.roleLabel}>Provider</div>
            <div style={s.roleDesc}>Offer services</div>
          </div>
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>Create Account</h2>
          <p style={s.cardSub}>Fill in your details to get started</p>

          {error && <div style={s.errorBox}>{error}</div>}
          {form.role === "provider" && (
            <div style={s.warningBox}>⏳ Providers need admin approval before listing services.</div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Full Name</label>
              <input style={s.input} type="text" placeholder="Your name" required
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Email address</label>
              <input style={s.input} type="email" placeholder="you@example.com" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Password</label>
              <input style={s.input} type="password" placeholder="Min 6 characters" required
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>I want to</label>
              <div style={s.roleToggle}>
                {[{v:"user", l:"Book Services"}, {v:"provider", l:"Provide Services"}].map(({v,l}) => (
                  <button type="button" key={v}
                    style={{ ...s.toggleBtn, ...(form.role===v ? s.toggleActive : {}) }}
                    onClick={() => setForm({ ...form, role:v })}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <button style={s.submitBtn} type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account →"}
            </button>
          </form>

          <p style={s.footer}>
            Already have an account?{" "}
            <Link to="/login" style={s.link}>Sign in</Link>
          </p>
          <p style={s.footer}>
            <Link to="/" style={s.link}>← Back to Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:"100vh", display:"grid", gridTemplateColumns:"1fr 1fr" },
  left: { background:`linear-gradient(135deg, ${T.sidebarBg} 0%, #1e1b4b 100%)`, padding:"60px 48px", display:"flex", flexDirection:"column", justifyContent:"center" },
  brand: { color:T.primary, fontWeight:"800", fontSize:"1.4rem", textDecoration:"none", marginBottom:"40px", display:"block" },
  heroText: { color:"#fff", fontSize:"2rem", fontWeight:"800", lineHeight:1.2, marginBottom:"14px" },
  heroSub: { color:"#94a3b8", fontSize:"0.95rem", lineHeight:1.6, marginBottom:"32px" },
  roleCards: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" },
  roleCard: { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"10px", padding:"16px", cursor:"pointer", textAlign:"center", transition:"all 0.15s" },
  roleCardActive: { background:`${T.primary}30`, border:`1px solid ${T.primary}` },
  roleIcon: { fontSize:"1.8rem", marginBottom:"6px" },
  roleLabel: { color:"#e2e8f0", fontWeight:"600", fontSize:"0.9rem" },
  roleDesc: { color:"#94a3b8", fontSize:"0.78rem", marginTop:"2px" },
  right: { background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 32px" },
  card: { background:T.cardBg, borderRadius:T.radiusLg, padding:"40px", boxShadow:T.shadowLg, width:"100%", maxWidth:"420px" },
  cardTitle: { color:T.text, fontSize:"1.5rem", fontWeight:"700", margin:"0 0 6px" },
  cardSub: { color:T.textMuted, fontSize:"0.88rem", marginBottom:"20px" },
  errorBox: { background:T.dangerBg, color:T.danger, padding:"10px 14px", borderRadius:"8px", marginBottom:"14px", fontSize:"0.88rem" },
  warningBox: { background:T.warningBg, color:"#92400e", padding:"10px 14px", borderRadius:"8px", marginBottom:"14px", fontSize:"0.85rem" },
  fieldGroup: { marginBottom:"14px" },
  label: { display:"block", color:T.textMuted, fontSize:"0.82rem", fontWeight:"500", marginBottom:"5px" },
  input: { width:"100%", padding:"11px 13px", borderRadius:"8px", border:`1px solid ${T.border}`, fontSize:"0.93rem", outline:"none", boxSizing:"border-box", background:"#f8fafc" },
  roleToggle: { display:"flex", gap:"8px" },
  toggleBtn: { flex:1, padding:"9px", border:`1px solid ${T.border}`, borderRadius:"7px", background:T.bg, cursor:"pointer", fontSize:"0.85rem", fontWeight:"500", color:T.textMuted },
  toggleActive: { background:T.primaryLight, color:T.primary, border:`1px solid ${T.primary}` },
  submitBtn: { width:"100%", padding:"12px", background:T.primary, color:"#fff", border:"none", borderRadius:"8px", fontSize:"1rem", fontWeight:"700", cursor:"pointer", marginTop:"6px" },
  footer: { textAlign:"center", color:T.textMuted, fontSize:"0.87rem", marginTop:"12px" },
  link: { color:T.primary, fontWeight:"600", textDecoration:"none" },
};
