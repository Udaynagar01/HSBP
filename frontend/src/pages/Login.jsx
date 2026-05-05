import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { T } from "../theme";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:"", password:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        email: form.email.trim(),
        password: form.password.trim(),
      };
      const { data } = await api.post("/auth/login", payload);
      login(data.token, data.user);
      if (data.user.role === "admin") navigate("/admin");
      else if (data.user.role === "provider") navigate("/provider/bookings");
      else navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.left}>
        <Link to="/" style={s.brand}>🔧 HSBP</Link>
        <h1 style={s.heroText}>Welcome back!</h1>
        <p style={s.heroSub}>Sign in to manage your bookings and services.</p>
        <div style={s.featureList}>
          {["Book trusted local professionals","Track your bookings in real-time","Role-based dashboards for all users"].map((f) => (
            <div key={f} style={s.featureItem}><span style={s.featureDot} />  {f}</div>
          ))}
        </div>
      </div>

      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>Sign In</h2>
          <p style={s.cardSub}>Enter your credentials to continue</p>

          {error && <div style={s.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={s.fieldGroup}>
              <label style={s.label}>Email address</label>
              <input style={s.input} type="email" placeholder="you@example.com" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div style={s.fieldGroup}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"5px" }}>
                <label style={s.label}>Password</label>
                <Link to="/forgot-password" style={{ ...s.link, fontSize:"0.8rem" }}>Forgot password?</Link>
              </div>
              <input style={s.input} type="password" placeholder="••••••••" required
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button style={s.submitBtn} type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <p style={s.footer}>
            Don&apos;t have an account?{" "}
            <Link to="/register" style={s.link}>Create one</Link>
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
  brand: { color:T.primary, fontWeight:"800", fontSize:"1.4rem", textDecoration:"none", marginBottom:"48px", display:"block" },
  heroText: { color:"#fff", fontSize:"2.2rem", fontWeight:"800", lineHeight:1.2, marginBottom:"14px" },
  heroSub: { color:"#94a3b8", fontSize:"1rem", lineHeight:1.6, marginBottom:"36px" },
  featureList: { display:"flex", flexDirection:"column", gap:"12px" },
  featureItem: { display:"flex", alignItems:"center", gap:"10px", color:"#cbd5e1", fontSize:"0.9rem" },
  featureDot: { width:"8px", height:"8px", borderRadius:"50%", background:T.primary, flexShrink:0 },
  right: { background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 32px" },
  card: { background:T.cardBg, borderRadius:T.radiusLg, padding:"40px", boxShadow:T.shadowLg, width:"100%", maxWidth:"400px" },
  cardTitle: { color:T.text, fontSize:"1.5rem", fontWeight:"700", margin:"0 0 6px" },
  cardSub: { color:T.textMuted, fontSize:"0.88rem", marginBottom:"24px" },
  errorBox: { background:T.dangerBg, color:T.danger, padding:"10px 14px", borderRadius:"8px", marginBottom:"16px", fontSize:"0.88rem", border:`1px solid ${T.danger}30` },
  fieldGroup: { marginBottom:"16px" },
  label: { display:"block", color:T.textMuted, fontSize:"0.82rem", fontWeight:"500", marginBottom:"5px" },
  input: { width:"100%", padding:"11px 13px", borderRadius:"8px", border:`1px solid ${T.border}`, fontSize:"0.93rem", outline:"none", boxSizing:"border-box", background:"#f8fafc" },
  submitBtn: { width:"100%", padding:"12px", background:T.primary, color:"#fff", border:"none", borderRadius:"8px", fontSize:"1rem", fontWeight:"700", cursor:"pointer", marginTop:"4px" },
  footer: { textAlign:"center", color:T.textMuted, fontSize:"0.87rem", marginTop:"14px" },
  link: { color:T.primary, fontWeight:"600", textDecoration:"none" },
};
