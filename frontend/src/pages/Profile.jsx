import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import api from "../api/axios";
import { T, roleColor } from "../theme";

const ROLE_LABELS = { user:"Customer", provider:"Service Provider", admin:"Administrator" };

export default function Profile() {
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.patch("/auth/profile", { name });
      login(localStorage.getItem("token"), { ...user, name: data.name });
      setEditing(false);
      addToast("Profile updated!", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Profile</h1>
        <p style={s.pageSub}>Manage your account information</p>
      </div>

      <div style={s.grid}>
        {/* Avatar card */}
        <div style={s.avatarCard}>
          <div style={s.bigAvatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div style={s.avatarName}>{user?.name}</div>
          <div style={{ ...s.rolePill, background: roleColor(user?.role)+"20", color: roleColor(user?.role) }}>
            {ROLE_LABELS[user?.role]}
          </div>
          {user?.role === "provider" && (
            <div style={{ ...s.rolePill, background: user?.isApproved ? T.successBg : T.warningBg, color: user?.isApproved ? T.success : T.warning, marginTop:"6px" }}>
              {user?.isApproved ? "✅ Approved" : "⏳ Pending Approval"}
            </div>
          )}
        </div>

        {/* Details card */}
        <div style={s.detailsCard}>
          <h3 style={s.sectionTitle}>Account Details</h3>
          <div style={s.fieldRow}>
            <div style={s.fieldLabel}>Email</div>
            <div style={s.fieldValue}>{user?.email}</div>
          </div>
          <div style={s.fieldRow}>
            <div style={s.fieldLabel}>Role</div>
            <div style={s.fieldValue}>{ROLE_LABELS[user?.role]}</div>
          </div>
          <div style={{ ...s.fieldRow, alignItems: editing ? "flex-start" : "center" }}>
            <div style={s.fieldLabel}>Display Name</div>
            <div style={{ ...s.fieldValue, flex:1 }}>
              {editing ? (
                <form onSubmit={handleSave} style={s.editForm}>
                  <input style={s.editInput} value={name} required autoFocus
                    onChange={(e) => setName(e.target.value)} />
                  <button style={s.saveBtn} type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button type="button" style={s.cancelBtn}
                    onClick={() => { setEditing(false); setName(user?.name); }}>
                    Cancel
                  </button>
                </form>
              ) : (
                <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                  <span>{user?.name}</span>
                  <button style={s.editBtn} onClick={() => setEditing(true)}>✏️ Edit</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  pageHead: { marginBottom:"24px" },
  pageTitle: { fontSize:"1.5rem", fontWeight:"700", color:T.text, margin:"0 0 4px" },
  pageSub: { color:T.textMuted, fontSize:"0.88rem", margin:0 },
  grid: { display:"grid", gridTemplateColumns:"260px 1fr", gap:"20px", alignItems:"start" },
  avatarCard: { background:T.cardBg, borderRadius:T.radiusLg, padding:"32px 20px", boxShadow:T.shadow, textAlign:"center" },
  bigAvatar: {
    width:"80px", height:"80px", borderRadius:"50%",
    background:`linear-gradient(135deg, ${T.primary}, #8b5cf6)`,
    color:"#fff", fontSize:"2rem", fontWeight:"bold",
    display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px",
  },
  avatarName: { fontWeight:"700", color:T.text, fontSize:"1.1rem", marginBottom:"10px" },
  rolePill: { display:"inline-block", borderRadius:"20px", padding:"4px 14px", fontSize:"0.8rem", fontWeight:"600" },
  detailsCard: { background:T.cardBg, borderRadius:T.radiusLg, padding:"24px", boxShadow:T.shadow },
  sectionTitle: { color:T.text, fontWeight:"600", fontSize:"1rem", marginBottom:"16px" },
  fieldRow: { display:"flex", gap:"16px", padding:"14px 0", borderBottom:`1px solid ${T.border}` },
  fieldLabel: { color:T.textMuted, fontSize:"0.85rem", fontWeight:"500", width:"120px", flexShrink:0, paddingTop:"2px" },
  fieldValue: { color:T.text, fontSize:"0.9rem" },
  editForm: { display:"flex", gap:"8px", flexWrap:"wrap" },
  editInput: { padding:"8px 12px", borderRadius:"7px", border:`1px solid ${T.border}`, fontSize:"0.9rem", outline:"none", minWidth:"160px" },
  saveBtn: { padding:"8px 16px", background:T.primary, color:"#fff", border:"none", borderRadius:"7px", cursor:"pointer", fontWeight:"600", fontSize:"0.85rem" },
  cancelBtn: { padding:"8px 14px", background:T.bg, color:T.text, border:`1px solid ${T.border}`, borderRadius:"7px", cursor:"pointer", fontSize:"0.85rem" },
  editBtn: { background:"none", border:"none", color:T.primary, cursor:"pointer", fontSize:"0.85rem", fontWeight:"500" },
};
