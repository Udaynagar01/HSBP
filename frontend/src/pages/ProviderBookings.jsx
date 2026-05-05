import { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../components/Toast";
import { T, statusColor } from "../theme";

export default function ProviderBookings() {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    api.get("/bookings/provider").then((res) => setBookings(res.data)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    setActionLoading(id + status);
    try {
      await api.patch(`/bookings/${id}/status`, { status });
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status } : b));
      addToast(`Booking ${status}!`, "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to update", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const counts = {
    pending:   bookings.filter(b => b.status === "pending").length,
    accepted:  bookings.filter(b => b.status === "accepted").length,
    completed: bookings.filter(b => b.status === "completed").length,
  };

  return (
    <div>
      <div style={s.pageHead}>
        <div>
          <h1 style={s.pageTitle}>Assigned Bookings</h1>
          <p style={s.pageSub}>Respond to customer booking requests</p>
        </div>
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label:"Total",     value:bookings.length,  color:T.primary },
          { label:"Pending",   value:counts.pending,   color:T.warning },
          { label:"Accepted",  value:counts.accepted,  color:T.info },
          { label:"Completed", value:counts.completed, color:T.success },
        ].map((st) => (
          <div key={st.label} style={s.statCard}>
            <div style={{ ...s.statNum, color:st.color }}>{st.value}</div>
            <div style={s.statLabel}>{st.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <p style={s.empty}>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <div style={s.emptyCard}>
          <div style={s.emptyIcon}>📋</div>
          <h3 style={s.emptyTitle}>No bookings yet</h3>
          <p style={s.emptyText}>Bookings for your services will appear here.</p>
        </div>
      ) : (
        <div style={s.list}>
          {bookings.map((b) => (
            <div key={b._id} style={s.card}>
              <div style={s.cardTop}>
                <div style={s.cardLeft}>
                  <div style={s.iconBox}>{getCatIcon(b.service?.category)}</div>
                  <div>
                    <div style={s.cardTitle}>{b.service?.title}</div>
                    <div style={s.meta}>{b.service?.category} · ₹{b.service?.price}</div>
                  </div>
                </div>
                <div style={s.badgesCol}>
                  <span style={{ ...s.statusBadge, background: statusColor(b.status) + "20", color: statusColor(b.status), border: `1px solid ${statusColor(b.status)}40` }}>
                    {b.status.toUpperCase()}
                  </span>
                  <span style={{ ...s.paymentBadge, ...getPaymentBadgeStyle(b.paymentStatus) }}>
                    PAYMENT: {(b.paymentStatus || "pending").toUpperCase()}
                  </span>
                </div>
              </div>
              <div style={s.metaGrid}>
                <span style={s.meta}>👤 {b.user?.name} · {b.user?.email}</span>
                <span style={s.meta}>📍 {b.address}</span>
                <span style={s.meta}>🗓️ {new Date(b.scheduledAt).toLocaleString()}</span>
                <span style={s.meta}>💳 Amount: ₹{b.amount ?? b.service?.price ?? 0}</span>
              </div>
              {b.status === "pending" && (
                <div style={s.actions}>
                  <button style={s.acceptBtn} disabled={actionLoading === b._id+"accepted"} onClick={() => updateStatus(b._id, "accepted")}>
                    {actionLoading === b._id+"accepted" ? "..." : "✅ Accept"}
                  </button>
                  <button style={s.declineBtn} disabled={actionLoading === b._id+"cancelled"} onClick={() => updateStatus(b._id, "cancelled")}>
                    {actionLoading === b._id+"cancelled" ? "..." : "✕ Decline"}
                  </button>
                </div>
              )}
              {b.status === "accepted" && (
                <div style={s.actions}>
                  <button style={s.completeBtn} disabled={actionLoading === b._id+"completed"} onClick={() => updateStatus(b._id, "completed")}>
                    {actionLoading === b._id+"completed" ? "..." : "🏁 Mark as Complete"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getCatIcon(cat) {
  return { Plumbing:"🔧", Electrical:"⚡", Cleaning:"🧹", Carpentry:"🪚", Painting:"🎨", "AC Repair":"❄️" }[cat] || "🛠️";
}

function getPaymentBadgeStyle(paymentStatus) {
  const status = paymentStatus || "pending";
  if (status === "paid") {
    return { background: T.successBg, color: T.success, border: `1px solid ${T.success}40` };
  }
  if (status === "failed") {
    return { background: T.dangerBg, color: T.danger, border: `1px solid ${T.danger}40` };
  }
  return { background: T.warningBg, color: T.warning, border: `1px solid ${T.warning}40` };
}

const s = {
  pageHead: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"24px", flexWrap:"wrap", gap:"12px" },
  pageTitle: { fontSize:"1.5rem", fontWeight:"700", color:T.text, margin:"0 0 4px" },
  pageSub: { color:T.textMuted, fontSize:"0.88rem", margin:0 },
  statsRow: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))", gap:"14px", marginBottom:"24px" },
  statCard: { background:T.cardBg, borderRadius:T.radius, padding:"18px 16px", boxShadow:T.shadow, textAlign:"center" },
  statNum: { fontSize:"1.9rem", fontWeight:"800" },
  statLabel: { color:T.textMuted, fontSize:"0.8rem", marginTop:"3px" },
  empty: { textAlign:"center", padding:"60px", color:T.textMuted },
  emptyCard: { background:T.cardBg, borderRadius:T.radiusLg, padding:"60px 32px", textAlign:"center", boxShadow:T.shadow, maxWidth:"400px", margin:"0 auto" },
  emptyIcon: { fontSize:"3rem", marginBottom:"16px" },
  emptyTitle: { color:T.text, fontSize:"1.1rem", marginBottom:"8px" },
  emptyText: { color:T.textMuted, fontSize:"0.9rem" },
  list: { display:"flex", flexDirection:"column", gap:"12px" },
  card: { background:T.cardBg, borderRadius:T.radius, padding:"18px 20px", boxShadow:T.shadow },
  cardTop: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" },
  cardLeft: { display:"flex", gap:"12px", alignItems:"center" },
  badgesCol: { display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"6px" },
  iconBox: { width:"40px", height:"40px", borderRadius:"9px", background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem" },
  cardTitle: { fontWeight:"600", color:T.text, fontSize:"0.97rem" },
  meta: { color:T.textMuted, fontSize:"0.82rem" },
  metaGrid: { display:"flex", flexDirection:"column", gap:"3px", marginBottom:"14px" },
  statusBadge: { padding:"4px 12px", borderRadius:"20px", fontSize:"0.75rem", fontWeight:"700" },
  paymentBadge: { padding:"4px 12px", borderRadius:"20px", fontSize:"0.72rem", fontWeight:"700" },
  actions: { display:"flex", gap:"10px", flexWrap:"wrap" },
  acceptBtn: { padding:"8px 18px", background:T.successBg, color:T.success, border:`1px solid ${T.success}40`, borderRadius:"8px", cursor:"pointer", fontWeight:"600", fontSize:"0.85rem" },
  declineBtn: { padding:"8px 18px", background:T.dangerBg, color:T.danger, border:`1px solid ${T.danger}40`, borderRadius:"8px", cursor:"pointer", fontWeight:"600", fontSize:"0.85rem" },
  completeBtn: { padding:"8px 18px", background:T.infoBg, color:T.info, border:`1px solid ${T.info}40`, borderRadius:"8px", cursor:"pointer", fontWeight:"600", fontSize:"0.85rem" },
};
