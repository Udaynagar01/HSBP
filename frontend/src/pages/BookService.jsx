import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { T } from "../theme";

export default function BookService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [form, setForm] = useState({ address:"", scheduledAt:"" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get("/services").then((res) => setService(res.data.find((s) => s._id === id)));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const paymentOrderRes = await api.post("/bookings/payment/order", { serviceId: id });
      const paymentResult = paymentOrderRes.data.mockMode
        ? await runDemoPayment(paymentOrderRes.data.amount)
        : await openRazorpayCheckout({
            order: paymentOrderRes.data,
            user,
          });
      await api.post("/bookings", {
        serviceId: id,
        ...form,
        razorpayOrderId: paymentResult.razorpay_order_id,
        razorpayPaymentId: paymentResult.razorpay_payment_id,
        razorpaySignature: paymentResult.razorpay_signature,
        paymentMode: paymentOrderRes.data.mockMode ? "demo" : "razorpay",
      });
      setSuccess(true);
      addToast("Payment successful and booking confirmed!", "success");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      addToast(err.response?.data?.message || "Booking failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!service) return <div style={{ color:T.textMuted, padding:"40px", textAlign:"center" }}>Loading service details...</div>;

  return (
    <div>
      <div style={s.pageHead}>
        <h1 style={s.pageTitle}>Book Service</h1>
        <p style={s.pageSub}>Fill in the details to confirm your booking</p>
      </div>

      <div style={s.layout}>
        {/* Service summary card */}
        <div style={s.summaryCard}>
          <div style={s.summaryIcon}>{getCatIcon(service.category)}</div>
          <h2 style={s.summaryTitle}>{service.title}</h2>
          <span style={s.catBadge}>{service.category}</span>
          <div style={s.price}>₹{service.price}</div>
          <div style={s.providerRow}>
            <div style={s.providerAvatar}>{service.provider?.name?.charAt(0)}</div>
            <div>
              <div style={s.providerName}>{service.provider?.name}</div>
              <div style={s.providerEmail}>{service.provider?.email}</div>
            </div>
          </div>
          {service.description && <p style={s.description}>{service.description}</p>}
        </div>

        {/* Booking form */}
        <div style={s.formCard}>
          {success ? (
            <div style={s.successBox}>
              <div style={s.successIcon}>✅</div>
              <h3 style={s.successTitle}>Booking Confirmed!</h3>
              <p style={s.successText}>Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 style={s.formTitle}>Booking Details</h3>
              <div style={s.fieldGroup}>
                <label style={s.label}>Your Address</label>
                <input style={s.input} type="text" placeholder="Enter your full address" required
                  value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>Preferred Date & Time</label>
                <input style={s.input} type="datetime-local" required
                  value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
              </div>
              <div style={s.btnRow}>
                <button style={s.primaryBtn} type="submit" disabled={loading}>
                  {loading ? "Processing Payment..." : `Pay ₹${service.price} & Confirm`}
                </button>
                <button type="button" style={s.outlineBtn} onClick={() => navigate("/services")}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

async function runDemoPayment(_amount) {
  return {
    razorpay_order_id: `demo_order_${Date.now()}`,
    razorpay_payment_id: `demo_pay_${Date.now()}`,
    razorpay_signature: "demo_signature",
  };
}

async function loadRazorpayScript() {
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function openRazorpayCheckout({ order, user }) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error("Unable to load payment gateway. Please try again.");
  }

  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: "HSBP",
      description: `Payment for ${order.serviceTitle}`,
      order_id: order.orderId,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
      },
      handler: function (response) {
        resolve(response);
      },
      modal: {
        ondismiss: function () {
          reject(new Error("Payment was cancelled"));
        },
      },
      theme: { color: T.primary },
    });

    razorpay.open();
  });
}

function getCatIcon(cat) {
  return { Plumbing:"🔧", Electrical:"⚡", Cleaning:"🧹", Carpentry:"🪚", Painting:"🎨", "AC Repair":"❄️" }[cat] || "🛠️";
}

const s = {
  pageHead: { marginBottom:"24px" },
  pageTitle: { fontSize:"1.5rem", fontWeight:"700", color:T.text, margin:"0 0 4px" },
  pageSub: { color:T.textMuted, fontSize:"0.88rem", margin:0 },
  layout: { display:"grid", gridTemplateColumns:"300px 1fr", gap:"20px", alignItems:"start" },
  summaryCard: { background:T.cardBg, borderRadius:T.radiusLg, padding:"24px", boxShadow:T.shadow },
  summaryIcon: { fontSize:"2.5rem", marginBottom:"12px" },
  summaryTitle: { fontWeight:"700", color:T.text, fontSize:"1.15rem", marginBottom:"8px" },
  catBadge: { display:"inline-block", background:T.primaryLight, color:T.primary, borderRadius:"12px", padding:"3px 10px", fontSize:"0.78rem", fontWeight:"600", marginBottom:"10px" },
  price: { fontSize:"1.8rem", fontWeight:"800", color:T.primary, marginBottom:"16px" },
  providerRow: { display:"flex", alignItems:"center", gap:"10px", padding:"12px 0", borderTop:`1px solid ${T.border}` },
  providerAvatar: { width:"34px", height:"34px", borderRadius:"50%", background:T.primaryLight, color:T.primary, fontWeight:"bold", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  providerName: { fontWeight:"600", color:T.text, fontSize:"0.88rem" },
  providerEmail: { color:T.textMuted, fontSize:"0.78rem" },
  description: { color:T.textMuted, fontSize:"0.85rem", marginTop:"12px", lineHeight:1.6 },
  formCard: { background:T.cardBg, borderRadius:T.radiusLg, padding:"28px", boxShadow:T.shadow },
  formTitle: { color:T.text, fontWeight:"600", fontSize:"1rem", marginBottom:"20px" },
  fieldGroup: { marginBottom:"16px" },
  label: { display:"block", color:T.textMuted, fontSize:"0.82rem", fontWeight:"500", marginBottom:"6px" },
  input: { width:"100%", padding:"11px 13px", borderRadius:"8px", border:`1px solid ${T.border}`, fontSize:"0.92rem", outline:"none", boxSizing:"border-box" },
  btnRow: { display:"flex", gap:"12px", marginTop:"24px" },
  primaryBtn: { padding:"11px 24px", background:T.primary, color:"#fff", border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"600", fontSize:"0.93rem" },
  outlineBtn: { padding:"11px 20px", background:"transparent", color:T.text, border:`1px solid ${T.border}`, borderRadius:"8px", cursor:"pointer", fontWeight:"500", fontSize:"0.93rem" },
  successBox: { textAlign:"center", padding:"40px 20px" },
  successIcon: { fontSize:"3rem", marginBottom:"16px" },
  successTitle: { color:T.text, fontSize:"1.2rem", marginBottom:"8px" },
  successText: { color:T.textMuted, fontSize:"0.9rem" },
};
