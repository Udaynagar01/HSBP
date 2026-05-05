import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { T } from "../theme";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setResetToken(data.resetToken);
    } catch (err) {
      setError(err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <Link to="/login" style={s.back}>← Back to Login</Link>
        <div style={s.iconWrap}>🔑</div>
        <h2 style={s.title}>Forgot Password?</h2>
        <p style={s.sub}>Enter your registered email and we&apos;ll generate a reset link for you.</p>

        {!resetToken ? (
          <form onSubmit={handleSubmit}>
            {error && <div style={s.errorBox}>{error}</div>}
            <div style={s.fieldGroup}>
              <label style={s.label}>Email address</label>
              <input style={s.input} type="email" placeholder="you@example.com" required
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button style={s.submitBtn} type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate Reset Link"}
            </button>
          </form>
        ) : (
          <div style={s.tokenBox}>
            <div style={s.tokenSuccess}>✅ Reset token generated!</div>
            <p style={s.tokenNote}>
              In production this would be emailed. For this demo, copy the link below and open it:
            </p>
            <div style={s.tokenLinkWrap}>
              <code style={s.tokenLink}>
                {window.location.origin}/reset-password/{resetToken}
              </code>
            </div>
            <Link
              to={`/reset-password/${resetToken}`}
              style={s.goResetBtn}>
              Go to Reset Password Page →
            </Link>
            <p style={s.expiry}>⏰ This link expires in 1 hour.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" },
  card: { background:T.cardBg, borderRadius:T.radiusLg, padding:"40px", boxShadow:T.shadowLg, width:"100%", maxWidth:"440px" },
  back: { color:T.primary, fontSize:"0.85rem", fontWeight:"500", display:"inline-block", marginBottom:"20px" },
  iconWrap: { fontSize:"2.5rem", marginBottom:"14px" },
  title: { color:T.text, fontSize:"1.5rem", fontWeight:"700", marginBottom:"8px" },
  sub: { color:T.textMuted, fontSize:"0.9rem", marginBottom:"24px", lineHeight:1.6 },
  errorBox: { background:T.dangerBg, color:T.danger, padding:"10px 14px", borderRadius:"8px", marginBottom:"16px", fontSize:"0.88rem" },
  fieldGroup: { marginBottom:"16px" },
  label: { display:"block", color:T.textMuted, fontSize:"0.82rem", fontWeight:"500", marginBottom:"5px" },
  input: { width:"100%", padding:"11px 13px", borderRadius:"8px", border:`1px solid ${T.border}`, fontSize:"0.93rem", outline:"none", boxSizing:"border-box", background:"#f8fafc" },
  submitBtn: { width:"100%", padding:"12px", background:T.primary, color:"#fff", border:"none", borderRadius:"8px", fontSize:"1rem", fontWeight:"700", cursor:"pointer" },
  tokenBox: { marginTop:"4px" },
  tokenSuccess: { background:T.successBg, color:T.success, padding:"10px 14px", borderRadius:"8px", marginBottom:"14px", fontWeight:"600", fontSize:"0.9rem" },
  tokenNote: { color:T.textMuted, fontSize:"0.85rem", marginBottom:"12px", lineHeight:1.6 },
  tokenLinkWrap: { background:T.bg, border:`1px solid ${T.border}`, borderRadius:"8px", padding:"12px 14px", marginBottom:"16px", wordBreak:"break-all" },
  tokenLink: { color:T.primary, fontSize:"0.82rem" },
  goResetBtn: { display:"block", width:"100%", padding:"11px", background:T.primary, color:"#fff", borderRadius:"8px", textAlign:"center", fontWeight:"700", fontSize:"0.93rem", marginBottom:"12px" },
  expiry: { color:T.textMuted, fontSize:"0.8rem", textAlign:"center" },
};
