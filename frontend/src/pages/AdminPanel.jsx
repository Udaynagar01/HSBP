import { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../components/Toast";
import { T, statusColor } from "../theme";

export default function AdminPanel() {
  const { addToast } = useToast();
  const [tab, setTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [pwModal, setPwModal] = useState(null);
  const [newPw, setNewPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    api.get("/admin/users").then((r) => setUsers(r.data));
    api.get("/admin/bookings").then((r) => setBookings(r.data));
  }, []);

  const openPwModal  = (u)  => { setPwModal(u); setNewPw(""); };
  const closePwModal = ()   => { setPwModal(null); setNewPw(""); };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPw.length < 6) { addToast("Password must be at least 6 characters", "warning"); return; }
    setPwLoading(true);
    try {
      const { data } = await api.patch(`/admin/users/${pwModal.id}/password`, { newPassword: newPw });
      addToast(data.message, "success");
      closePwModal();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setPwLoading(false);
    }
  };

  const handleApproval = async (id, isApproved) => {
    try {
      await api.patch(`/admin/providers/${id}/approval`, { isApproved });
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isApproved } : u));
      addToast(`Provider ${isApproved ? "approved" : "rejected"}.`, isApproved ? "success" : "warning");
    } catch {
      addToast("Failed to update provider.", "error");
    }
  };

  const providers        = users.filter((u) => u.role === "provider");
  const customers        = users.filter((u) => u.role === "user");
  const pendingProviders = providers.filter((p) => !p.isApproved).length;

  const stats = [
    { label: "Customers",       value: customers.length,                                  color: T.info,    icon: "👥" },
    { label: "Providers",       value: providers.length,                                  color: T.success, icon: "🧑‍🔧" },
    { label: "Pending Approval",value: pendingProviders,                                  color: T.warning, icon: "⏳" },
    { label: "Total Bookings",  value: bookings.length,                                   color: T.primary, icon: "📋" },
    { label: "Pending Bookings",value: bookings.filter(b => b.status === "pending").length, color: T.warning, icon: "🕐" },
    { label: "Completed",       value: bookings.filter(b => b.status === "completed").length, color: T.success, icon: "✅" },
  ];

  const TABS = [
    { id: "overview",  label: "Overview" },
    { id: "customers", label: `Customers (${customers.length})` },
    { id: "providers", label: `Providers (${providers.length})` },
    { id: "bookings",  label: `Bookings (${bookings.length})` },
  ];

  return (
    <>
      <div>
        {/* Page header */}
        <div style={s.pageHead}>
          <div>
            <h1 style={s.pageTitle}>Admin Panel</h1>
            <p style={s.pageSub}>Manage users, providers, and platform activity</p>
          </div>
          {pendingProviders > 0 && (
            <div style={s.alertBadge}>
              ⚠️ {pendingProviders} provider{pendingProviders > 1 ? "s" : ""} awaiting approval
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {stats.map((st) => (
            <div key={st.label} style={s.statCard}>
              <div style={s.statIcon}>{st.icon}</div>
              <div style={{ ...s.statNum, color: st.color }}>{st.value}</div>
              <div style={s.statLabel}>{st.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={s.tabRow}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ ...s.tabBtn, ...(tab === t.id ? s.tabActive : {}) }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={s.tableCard}>

          {/* Overview */}
          {tab === "overview" && (
            <div style={s.overviewGrid}>
              <div style={s.overviewSection}>
                <h3 style={s.sectionTitle}>Recent Bookings</h3>
                {bookings.length === 0 && <p style={s.emptyNote}>No bookings yet.</p>}
                {bookings.slice(0, 5).map((b) => (
                  <div key={b._id} style={s.overviewRow}>
                    <div>
                      <div style={s.rowTitle}>{b.service?.title}</div>
                      <div style={s.rowMeta}>{b.user?.name} → {b.provider?.name}</div>
                    </div>
                    <span style={{ ...s.statusBadge, background: statusColor(b.status) + "20", color: statusColor(b.status), border: `1px solid ${statusColor(b.status)}40` }}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
              <div style={s.overviewSection}>
                <h3 style={s.sectionTitle}>Pending Provider Approvals</h3>
                {providers.filter(p => !p.isApproved).length === 0 ? (
                  <p style={s.emptyNote}>All providers are approved ✅</p>
                ) : providers.filter(p => !p.isApproved).map((p) => (
                  <div key={p._id} style={s.overviewRow}>
                    <div>
                      <div style={s.rowTitle}>{p.name}</div>
                      <div style={s.rowMeta}>{p.email}</div>
                    </div>
                    <button style={s.approveBtn} onClick={() => handleApproval(p._id, true)}>Approve</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers */}
          {tab === "customers" && (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th>Name</th><th>Email</th><th>Joined</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((u) => (
                    <tr key={u._id} style={s.tr}>
                      <td style={s.td}>
                        <div style={s.avatarRow}>
                          <div style={s.miniAvatar}>{u.name.charAt(0)}</div>
                          {u.name}
                        </div>
                      </td>
                      <td style={s.td}>{u.email}</td>
                      <td style={s.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={s.td}>
                        <button style={s.pwBtn} onClick={() => openPwModal({ id: u._id, name: u.name })}>
                          🔑 Change Password
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Providers */}
          {tab === "providers" && (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th>Name</th><th>Email</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((p) => (
                    <tr key={p._id} style={s.tr}>
                      <td style={s.td}>
                        <div style={s.avatarRow}>
                          <div style={s.miniAvatar}>{p.name.charAt(0)}</div>
                          {p.name}
                        </div>
                      </td>
                      <td style={s.td}>{p.email}</td>
                      <td style={s.td}>
                        <span style={{
                          ...s.statusBadge,
                          background: p.isApproved ? T.successBg : T.warningBg,
                          color: p.isApproved ? T.success : T.warning,
                          border: `1px solid ${p.isApproved ? T.success : T.warning}40`,
                        }}>
                          {p.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {p.isApproved
                            ? <button style={s.rejectBtn} onClick={() => handleApproval(p._id, false)}>Revoke</button>
                            : <button style={s.approveBtn} onClick={() => handleApproval(p._id, true)}>Approve</button>
                          }
                          <button style={s.pwBtn} onClick={() => openPwModal({ id: p._id, name: p.name })}>🔑 Pwd</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bookings */}
          {tab === "bookings" && (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <tr style={s.thead}>
                    <th>Service</th><th>Customer</th><th>Provider</th><th>Date</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id} style={s.tr}>
                      <td style={s.td}>{b.service?.title}</td>
                      <td style={s.td}>{b.user?.name}</td>
                      <td style={s.td}>{b.provider?.name}</td>
                      <td style={s.td}>{new Date(b.scheduledAt).toLocaleDateString()}</td>
                      <td style={s.td}>
                        <span style={{ ...s.statusBadge, background: statusColor(b.status) + "20", color: statusColor(b.status), border: `1px solid ${statusColor(b.status)}40` }}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* Change Password Modal — rendered as sibling inside Fragment */}
      {pwModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <h3 style={s.modalTitle}>Change Password</h3>
            <p style={s.modalSub}>Set a new password for <strong>{pwModal.name}</strong></p>
            <form onSubmit={handleChangePassword}>
              <div style={s.fieldGroup}>
                <label style={s.label}>New Password</label>
                <input
                  style={s.input}
                  type="password"
                  placeholder="Min 6 characters"
                  required
                  autoFocus
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                />
              </div>
              <div style={s.modalBtns}>
                <button style={s.primaryBtn} type="submit" disabled={pwLoading}>
                  {pwLoading ? "Saving..." : "Save Password"}
                </button>
                <button type="button" style={s.outlineBtn} onClick={closePwModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const s = {
  pageHead:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" },
  pageTitle:     { fontSize: "1.5rem", fontWeight: "700", color: T.text, margin: "0 0 4px" },
  pageSub:       { color: T.textMuted, fontSize: "0.88rem", margin: 0 },
  alertBadge:    { background: T.warningBg, color: "#92400e", border: `1px solid ${T.warning}40`, borderRadius: "8px", padding: "8px 14px", fontSize: "0.85rem", fontWeight: "600" },

  statsGrid:  { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "14px", marginBottom: "24px" },
  statCard:   { background: T.cardBg, borderRadius: T.radius, padding: "16px", boxShadow: T.shadow, textAlign: "center" },
  statIcon:   { fontSize: "1.5rem", marginBottom: "6px" },
  statNum:    { fontSize: "1.8rem", fontWeight: "800" },
  statLabel:  { color: T.textMuted, fontSize: "0.78rem", marginTop: "3px" },

  tabRow:    { display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" },
  tabBtn:    { padding: "8px 18px", borderRadius: "8px", border: `1px solid ${T.border}`, background: T.cardBg, cursor: "pointer", fontWeight: "500", fontSize: "0.87rem", color: T.textMuted },
  tabActive: { background: T.primary, color: "#fff", border: `1px solid ${T.primary}` },

  tableCard:  { background: T.cardBg, borderRadius: T.radiusLg, boxShadow: T.shadow, overflow: "hidden" },
  tableWrap:  { overflowX: "auto" },
  table:      { width: "100%", borderCollapse: "collapse" },
  thead:      { background: T.bg },
  tr:         { borderBottom: `1px solid ${T.border}` },
  td:         { padding: "13px 16px", fontSize: "0.88rem", color: T.text },
  statusBadge:{ padding: "3px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700" },
  avatarRow:  { display: "flex", alignItems: "center", gap: "10px" },
  miniAvatar: { width: "28px", height: "28px", borderRadius: "50%", background: T.primaryLight, color: T.primary, fontSize: "0.8rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" },
  approveBtn: { padding: "6px 14px", background: T.successBg, color: T.success, border: `1px solid ${T.success}40`, borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.82rem" },
  rejectBtn:  { padding: "6px 14px", background: T.dangerBg,  color: T.danger,  border: `1px solid ${T.danger}40`,  borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.82rem" },
  pwBtn:      { padding: "6px 12px", background: T.primaryLight, color: T.primary, border: `1px solid ${T.primary}30`, borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.8rem" },

  overviewGrid:    { display: "grid", gridTemplateColumns: "1fr 1fr" },
  overviewSection: { padding: "20px 24px", borderRight: `1px solid ${T.border}` },
  sectionTitle:    { color: T.text, fontSize: "0.95rem", fontWeight: "600", marginBottom: "14px" },
  overviewRow:     { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` },
  rowTitle:        { fontWeight: "500", color: T.text, fontSize: "0.88rem" },
  rowMeta:         { color: T.textMuted, fontSize: "0.8rem" },
  emptyNote:       { color: T.textMuted, fontSize: "0.88rem", padding: "16px 0" },

  overlay:    { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  modal:      { background: T.cardBg, borderRadius: T.radiusLg, padding: "32px", boxShadow: T.shadowLg, width: "100%", maxWidth: "400px" },
  modalTitle: { color: T.text, fontSize: "1.1rem", fontWeight: "700", marginBottom: "6px" },
  modalSub:   { color: T.textMuted, fontSize: "0.88rem", marginBottom: "20px" },
  fieldGroup: { marginBottom: "16px" },
  label:      { display: "block", color: T.textMuted, fontSize: "0.82rem", fontWeight: "500", marginBottom: "5px" },
  input:      { width: "100%", padding: "11px 13px", borderRadius: "8px", border: `1px solid ${T.border}`, fontSize: "0.93rem", outline: "none", boxSizing: "border-box", background: "#f8fafc" },
  modalBtns:  { display: "flex", gap: "10px" },
  primaryBtn: { padding: "10px 20px", background: T.primary, color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "0.9rem" },
  outlineBtn: { padding: "10px 18px", background: "transparent", color: T.text, border: `1px solid ${T.border}`, borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "0.9rem" },
};
