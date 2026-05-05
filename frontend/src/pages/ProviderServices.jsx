import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { T } from "../theme";

const CATEGORIES = ["Plumbing","Electrical","Cleaning","Carpentry","Painting","AC Repair","Other"];

function getCatIcon(cat) {
  return { Plumbing:"🔧", Electrical:"⚡", Cleaning:"🧹", Carpentry:"🪚", Painting:"🎨", "AC Repair":"❄️" }[cat] || "🛠️";
}

export default function ProviderServices() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ title:"", category:"Plumbing", description:"", price:"" });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchServices = () => api.get("/services/mine").then((r) => setServices(r.data));
  useEffect(() => { fetchServices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/services", { ...form, price: Number(form.price) });
      addToast("Service added!", "success");
      setForm({ title:"", category:"Plumbing", description:"", price:"" });
      setShowForm(false);
      fetchServices();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to add service", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this service?")) return;
    setDeleting(id);
    try {
      await api.delete(`/services/${id}`);
      setServices((prev) => prev.filter((s) => s._id !== id));
      addToast("Service deleted.", "info");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete", "error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div style={s.pageHead}>
        <div>
          <h1 style={s.pageTitle}>My Services</h1>
          <p style={s.pageSub}>Manage the services you offer to customers</p>
        </div>
        {user?.isApproved && (
          <button style={showForm ? s.outlineBtn : s.primaryBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? "✕ Cancel" : "+ Add Service"}
          </button>
        )}
      </div>

      {!user?.isApproved && (
        <div style={s.warningBanner}>
          ⏳ Your account is pending admin approval. You cannot add services yet.
        </div>
      )}

      {/* Add service form */}
      {showForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitle}>New Service</h3>
          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.formGrid}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Service Title</label>
                <input style={s.input} placeholder="e.g. Pipe Leak Fix" required
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Category</label>
                <select style={s.input} value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Price (₹)</label>
                <input style={s.input} type="number" placeholder="0" required min="0"
                  value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div style={{ ...s.fieldGroup, gridColumn: "1 / -1" }}>
                <label style={s.label}>Description (optional)</label>
                <textarea style={{ ...s.input, height:"80px", resize:"vertical" }}
                  placeholder="Brief description of the service..."
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <button style={s.primaryBtn} type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Service"}
            </button>
          </form>
        </div>
      )}

      {/* Services grid */}
      {services.length === 0 ? (
        <div style={s.emptyCard}>
          <div style={s.emptyIcon}>🛠️</div>
          <h3 style={s.emptyTitle}>No services yet</h3>
          <p style={s.emptyText}>Add your first service to start receiving bookings.</p>
        </div>
      ) : (
        <div style={s.grid}>
          {services.map((sv) => (
            <div key={sv._id} style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.iconBox}>{getCatIcon(sv.category)}</div>
                <span style={s.catBadge}>{sv.category}</span>
              </div>
              <div style={s.cardTitle}>{sv.title}</div>
              <div style={s.cardDesc}>{sv.description || "—"}</div>
              <div style={s.cardFooter}>
                <span style={s.price}>₹{sv.price}</span>
                <button style={s.deleteBtn} disabled={deleting === sv._id} onClick={() => handleDelete(sv._id)}>
                  {deleting === sv._id ? "..." : "🗑️"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  pageHead: { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px", flexWrap:"wrap", gap:"12px" },
  pageTitle: { fontSize:"1.5rem", fontWeight:"700", color:T.text, margin:"0 0 4px" },
  pageSub: { color:T.textMuted, fontSize:"0.88rem", margin:0 },
  primaryBtn: { padding:"10px 20px", background:T.primary, color:"#fff", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"600", fontSize:"0.9rem" },
  outlineBtn: { padding:"10px 20px", background:"transparent", color:T.text, border:`1px solid ${T.border}`, borderRadius:"8px", cursor:"pointer", fontWeight:"600", fontSize:"0.9rem" },
  warningBanner: { background:T.warningBg, color:"#92400e", border:`1px solid ${T.warning}40`, borderRadius:T.radius, padding:"12px 16px", marginBottom:"20px", fontWeight:"500", fontSize:"0.9rem" },
  formCard: { background:T.cardBg, borderRadius:T.radiusLg, padding:"24px", boxShadow:T.shadowMd, marginBottom:"24px" },
  formTitle: { color:T.text, marginBottom:"16px", fontSize:"1rem", fontWeight:"600" },
  form: {},
  formGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"16px" },
  fieldGroup: { display:"flex", flexDirection:"column", gap:"5px" },
  label: { color:T.textMuted, fontSize:"0.82rem", fontWeight:"500" },
  input: { padding:"10px 12px", borderRadius:"8px", border:`1px solid ${T.border}`, fontSize:"0.92rem", outline:"none", background:"#f8fafc", width:"100%", boxSizing:"border-box" },
  emptyCard: { background:T.cardBg, borderRadius:T.radiusLg, padding:"60px 32px", textAlign:"center", boxShadow:T.shadow },
  emptyIcon: { fontSize:"3rem", marginBottom:"16px" },
  emptyTitle: { color:T.text, fontSize:"1.1rem", marginBottom:"8px" },
  emptyText: { color:T.textMuted, fontSize:"0.9rem" },
  grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:"16px" },
  card: { background:T.cardBg, borderRadius:T.radius, padding:"18px", boxShadow:T.shadow },
  cardHeader: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" },
  iconBox: { width:"40px", height:"40px", borderRadius:"9px", background:T.primaryLight, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem" },
  catBadge: { background:T.primaryLight, color:T.primary, borderRadius:"12px", padding:"3px 10px", fontSize:"0.75rem", fontWeight:"600" },
  cardTitle: { fontWeight:"600", color:T.text, fontSize:"0.97rem", marginBottom:"6px" },
  cardDesc: { color:T.textMuted, fontSize:"0.83rem", marginBottom:"14px", minHeight:"20px" },
  cardFooter: { display:"flex", justifyContent:"space-between", alignItems:"center" },
  price: { fontWeight:"700", color:T.primary, fontSize:"1.1rem" },
  deleteBtn: { padding:"6px 10px", background:T.dangerBg, color:T.danger, border:"none", borderRadius:"6px", cursor:"pointer", fontSize:"0.9rem" },
};
