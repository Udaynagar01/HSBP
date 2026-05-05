import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../components/Toast";
import { T, statusColor } from "../theme";

export default function UserDashboard() {
  const { addToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/bookings/my").then((res) => setBookings(res.data)).finally(() => setLoading(false));
  }, []);

  const cancelBooking = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    setCancelling(id);
    try {
      await api.patch(`/bookings/${id}/status`, { status: "cancelled" });
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: "cancelled" } : b));
      addToast("Booking cancelled.", "info");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to cancel", "error");
    } finally {
      setCancelling(null);
    }
  };

  const activeCount = bookings.filter((b) => !["cancelled","completed"].includes(b.status)).length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  return (
    <div>
      {/* Page title */}
      <div style={s.pageHead}>
        <div>
          <h1 style={s.pageTitle}>My Bookings</h1>
          <p style={s.pageSub}>Track and manage all your service requests</p>
        </div>
        <button style={s.primaryBtn} onClick={() => navigate("/services")}>+ Book a Service</button>
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: "Total", value: bookings.length, color: T.primary },
          { label: "Active", value: activeCount, color: T.info },
          { label: "Completed", value: completedCount, color: T.success },
          { label: "Cancelled", value: bookings.filter(b => b.status === "cancelled").length, color: T.danger },
        ].map((stat) => (
          <div key={stat.label} style={s.statCard}>
            <div style={{ ...s.statNum, color: stat.color }}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Bookings list */}
      {loading ? (
        <div style={s.emptyState}>Loading your bookings...</div>
      ) : bookings.length === 0 ? (
        <div style={s.emptyCard}>
          <div style={s.emptyIcon}>📦</div>
          <h3 style={s.emptyTitle}>No bookings yet</h3>
          <p style={s.emptyText}>Browse available services and book your first one.</p>
          <button style={s.primaryBtn} onClick={() => navigate("/services")}>Browse Services</button>
        </div>
      ) : (
        <div style={s.list}>
          {bookings.map((b) => (
            <div key={b._id} style={s.card}>
              <div style={s.cardLeft}>
                <div style={s.serviceIconBg}>{getCatIcon(b.service?.category)}</div>
                <div style={s.cardInfo}>
                  <div style={s.cardTitle}>{b.service?.title}</div>
                  <div style={s.cardMeta}>{b.service?.category} · ₹{b.service?.price}</div>
                  <div style={s.cardMeta}>👨‍🔧 {b.provider?.name} · {b.provider?.email}</div>
                  <div style={s.cardMeta}>📍 {b.address}</div>
                  <div style={s.cardMeta}>🗓️ {new Date(b.scheduledAt).toLocaleString()}</div>
                </div>
              </div>
              <div style={s.cardRight}>
                <span style={{ ...s.statusBadge, background: statusColor(b.status) + "20", color: statusColor(b.status), border: `1px solid ${statusColor(b.status)}40` }}>
                  {b.status.toUpperCase()}
                </span>
                {b.status === "pending" && (
                  <button style={s.dangerBtn} disabled={cancelling === b._id} onClick={() => cancelBooking(b._id)}>
                    {cancelling === b._id ? "..." : "Cancel"}
                  </button>
                )}
              </div>
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

const s = {
  pageHead: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"24px", flexWrap:"wrap", gap:"12px" },
  pageTitle: { fontSize:"1.5rem", fontWeight:"700", color:T.text, margin:"0 0 4px" },
  pageSub: { color:T.textMuted, fontSize:"0.88rem", margin:0 },
  primaryBtn: { padding:"10px 20px", background:T.primary, color:"#fff", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"600", fontSize:"0.9rem" },
  dangerBtn: { padding:"7px 14px", background:T.dangerBg, color:T.danger, border:`1px solid ${T.danger}40`, borderRadius:"7px", cursor:"pointer", fontWeight:"600", fontSize:"0.82rem" },

  statsRow: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))", gap:"14px", marginBottom:"24px" },
  statCard: { background:T.cardBg, borderRadius:T.radius, padding:"18px 16px", boxShadow:T.shadow, textAlign:"center" },
  statNum: { fontSize:"1.9rem", fontWeight:"800" },
  statLabel: { color:T.textMuted, fontSize:"0.8rem", marginTop:"3px" },

  emptyState: { textAlign:"center", padding:"60px", color:T.textMuted },
  emptyCard: { background:T.cardBg, borderRadius:T.radiusLg, padding:"60px 32px", textAlign:"center", boxShadow:T.shadow, maxWidth:"420px", margin:"0 auto" },
  emptyIcon: { fontSize:"3rem", marginBottom:"16px" },
  emptyTitle: { color:T.text, fontSize:"1.1rem", marginBottom:"8px" },
  emptyText: { color:T.textMuted, fontSize:"0.9rem", marginBottom:"20px" },

  list: { display:"flex", flexDirection:"column", gap:"12px" },
  card: { background:T.cardBg, borderRadius:T.radius, padding:"18px 20px", boxShadow:T.shadow, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"16px", flexWrap:"wrap" },
  cardLeft: { display:"flex", gap:"14px", alignItems:"flex-start" },
  serviceIconBg: { width:"44px", height:"44px", borderRadius:"10px", background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem", flexShrink:0 },
  cardInfo: { display:"flex", flexDirection:"column", gap:"3px" },
  cardTitle: { fontWeight:"600", color:T.text, fontSize:"0.97rem" },
  cardMeta: { color:T.textMuted, fontSize:"0.82rem" },
  cardRight: { display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"10px" },
  statusBadge: { padding:"4px 12px", borderRadius:"20px", fontSize:"0.75rem", fontWeight:"700" },
};
