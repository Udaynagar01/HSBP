import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { T } from "../theme";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ newPassword:"", confirm:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirm) {
      return setError("Passwords do not match");
    }
    if (form.newPassword.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { newPassword: form.newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <Link to="/login" style={s.back}>← Back to Login</Link>
        <div style={s.iconWrap}>🔐</div>
        <h2 style={s.title}>Reset Password</h2>
        <p style={s.sub}>Enter and confirm your new password below.</p>

        {success ? (
          <div style={s.successBox}>
            <div style={s.successIcon}>✅</div>
            <h3 style={s.successTitle}>Password Reset!</h3>
            <p style={s.successText}>Redirecting to login in 3 seconds...</p>
            <Link to="/login" style={s.loginLink}>Go to Login →</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div style={s.errorBox}>{error}</div>}
            <div style={s.fieldGroup}>
              <label style={s.label}>New Password</label>
              <input style={s.input} type="password" placeholder="Min 6 characters" required
                value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
            </div>
            <div style={s.fieldGroup}>
              <label style={s.label}>Confirm New Password</label>
              <input style={s.input} type="password" placeholder="Repeat password" required
                value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            </div>
            <div style={s.strengthRow}>
              {["6+ chars", "Match"].map((hint, i) => {
                const pass = i === 0 ? form.newPassword.length >= 6 : form.newPassword === form.confirm && form.confirm.length > 0;
                return (
                  <span key={hint} style={{ ...s.hint, color: pass ? T.success : T.textMuted }}>
                    {pass ? "✓" : "○"} {hint}
                  </span>
                );
              })}
            </div>
            <button style={s.submitBtn} type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" },
  card: { background:T.cardBg, borderRadius:T.radiusLg, padding:"40px", boxShadow:T.shadowLg, width:"100%", maxWidth:"420px" },
  back: { color:T.primary, fontSize:"0.85rem", fontWeight:"500", display:"inline-block", marginBottom:"20px" },
  iconWrap: { fontSize:"2.5rem", marginBottom:"14px" },
  title: { color:T.text, fontSize:"1.5rem", fontWeight:"700", marginBottom:"8px" },
  sub: { color:T.textMuted, fontSize:"0.9rem", marginBottom:"24px", lineHeight:1.6 },
  errorBox: { background:T.dangerBg, color:T.danger, padding:"10px 14px", borderRadius:"8px", marginBottom:"16px", fontSize:"0.88rem" },
  fieldGroup: { marginBottom:"14px" },
  label: { display:"block", color:T.textMuted, fontSize:"0.82rem", fontWeight:"500", marginBottom:"5px" },
  input: { width:"100%", padding:"11px 13px", borderRadius:"8px", border:`1px solid ${T.border}`, fontSize:"0.93rem", outline:"none", boxSizing:"border-box", background:"#f8fafc" },
  strengthRow: { display:"flex", gap:"16px", marginBottom:"16px" },
  hint: { fontSize:"0.82rem", fontWeight:"500" },
  submitBtn: { width:"100%", padding:"12px", background:T.primary, color:"#fff", border:"none", borderRadius:"8px", fontSize:"1rem", fontWeight:"700", cursor:"pointer" },
  successBox: { textAlign:"center", padding:"16px 0" },
  successIcon: { fontSize:"3rem", marginBottom:"12px" },
  successTitle: { color:T.text, fontSize:"1.2rem", marginBottom:"8px" },
  successText: { color:T.textMuted, fontSize:"0.9rem", marginBottom:"16px" },
  loginLink: { display:"inline-block", padding:"10px 24px", background:T.primary, color:"#fff", borderRadius:"8px", fontWeight:"700", fontSize:"0.93rem" },
};
