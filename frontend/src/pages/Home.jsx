import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PublicNav from "../components/PublicNav";
import { T } from "../theme";

const SERVICES = [
  { icon:"🔧", label:"Plumbing",   desc:"Leaks, pipes, fittings" },
  { icon:"⚡", label:"Electrical",  desc:"Wiring, switches, panels" },
  { icon:"🧹", label:"Cleaning",   desc:"Home & office cleaning" },
  { icon:"🪚", label:"Carpentry",  desc:"Furniture, doors, frames" },
  { icon:"🎨", label:"Painting",   desc:"Interior & exterior" },
  { icon:"❄️", label:"AC Repair",  desc:"Service, gas refill, install" },
];

const STEPS = [
  { num:"01", title:"Create Account",    desc:"Register free as a customer or service provider in under a minute." },
  { num:"02", title:"Browse Services",   desc:"Explore services by category, view provider details and pricing." },
  { num:"03", title:"Book Instantly",    desc:"Select a time slot, enter your address, and confirm." },
  { num:"04", title:"Job Done",          desc:"Provider arrives, completes the work, you mark it done." },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div style={s.page}>
      <PublicNav />

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroBadge}>🏡 Hyperlocal · Trusted · Instant</div>
        <h1 style={s.heroTitle}>
          Book Local Professionals<br />
          <span style={s.heroAccent}>At Your Doorstep</span>
        </h1>
        <p style={s.heroSub}>
          Electricians, plumbers, cleaners and more — verified providers, transparent pricing, real-time tracking.
        </p>
        <div style={s.heroBtns}>
          <button style={s.btnPrimary} onClick={() => navigate("/services")}>
            Explore Services →
          </button>
          {!user && (
            <button style={s.btnOutline} onClick={() => navigate("/register")}>
              Become a Provider
            </button>
          )}
        </div>
        <div style={s.heroStats}>
          {[{ num:"6+", label:"Categories" }, { num:"24/7", label:"Availability" }, { num:"100%", label:"Verified" }].map((st) => (
            <div key={st.label} style={s.heroStat}>
              <div style={s.heroStatNum}>{st.num}</div>
              <div style={s.heroStatLabel}>{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Service categories */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <div style={s.sectionHead}>
            <h2 style={s.sectionTitle}>Our Services</h2>
            <p style={s.sectionSub}>Everything you need for your home, under one platform</p>
          </div>
          <div style={s.catGrid}>
            {SERVICES.map((sv) => (
              <div key={sv.label} style={s.catCard} onClick={() => navigate("/services")}>
                <div style={s.catIcon}>{sv.icon}</div>
                <div style={s.catLabel}>{sv.label}</div>
                <div style={s.catDesc}>{sv.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ ...s.section, background:T.sidebarBg }}>
        <div style={s.sectionInner}>
          <div style={s.sectionHead}>
            <h2 style={{ ...s.sectionTitle, color:"#fff" }}>How It Works</h2>
            <p style={{ ...s.sectionSub, color:"#64748b" }}>Get your service booked in 4 easy steps</p>
          </div>
          <div style={s.stepsGrid}>
            {STEPS.map((step, i) => (
              <div key={step.num} style={s.stepCard}>
                <div style={s.stepNum}>{step.num}</div>
                {i < STEPS.length - 1 && <div style={s.stepLine} />}
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ ...s.section, background:T.primaryLight }}>
        <div style={{ ...s.sectionInner, textAlign:"center" }}>
          <h2 style={{ ...s.sectionTitle, color:T.primaryDark }}>Ready to get started?</h2>
          <p style={{ ...s.sectionSub, marginBottom:"28px" }}>Join as a customer or start earning as a provider today.</p>
          <div style={s.heroBtns}>
            <button style={s.btnPrimary} onClick={() => navigate(user ? "/services" : "/register")}>
              {user ? "Browse Services →" : "Create Free Account →"}
            </button>
            {!user && (
              <button style={{ ...s.btnOutline, borderColor:T.primary, color:T.primary }} onClick={() => navigate("/login")}>
                Sign In
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <span style={s.footerBrand}>🔧 HSBP</span>
        <span style={s.footerText}>Hyperlocal Service Booking Platform · Built with MERN Stack</span>
      </footer>
    </div>
  );
}

const s = {
  page: { minHeight:"100vh", background:T.bg },
  hero: { background:`linear-gradient(160deg, ${T.sidebarBg} 0%, #1e1b4b 60%, #312e81 100%)`, color:"#fff", padding:"100px 40px 80px", textAlign:"center" },
  heroBadge: { display:"inline-block", background:`${T.primary}25`, color:T.primary, border:`1px solid ${T.primary}40`, borderRadius:"20px", padding:"6px 18px", fontSize:"0.82rem", fontWeight:"600", marginBottom:"22px", letterSpacing:"0.5px" },
  heroTitle: { fontSize:"3.2rem", fontWeight:"900", lineHeight:1.1, margin:"0 0 18px" },
  heroAccent: { color:T.primary },
  heroSub: { color:"#94a3b8", fontSize:"1.05rem", lineHeight:1.7, maxWidth:"560px", margin:"0 auto 32px" },
  heroBtns: { display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap", marginBottom:"48px" },
  btnPrimary: { padding:"13px 28px", background:T.primary, color:"#fff", border:"none", borderRadius:"8px", fontSize:"0.97rem", fontWeight:"700", cursor:"pointer" },
  btnOutline: { padding:"13px 28px", background:"transparent", color:"#fff", border:"1px solid rgba(255,255,255,0.25)", borderRadius:"8px", fontSize:"0.97rem", cursor:"pointer", fontWeight:"500" },
  heroStats: { display:"flex", justifyContent:"center", gap:"48px", flexWrap:"wrap" },
  heroStat: { textAlign:"center" },
  heroStatNum: { fontSize:"2rem", fontWeight:"800", color:T.primary },
  heroStatLabel: { color:"#64748b", fontSize:"0.82rem", marginTop:"2px" },
  section: { padding:"72px 40px", background:T.cardBg },
  sectionInner: { maxWidth:"1100px", margin:"0 auto" },
  sectionHead: { textAlign:"center", marginBottom:"44px" },
  sectionTitle: { fontSize:"1.9rem", fontWeight:"800", color:T.text, margin:"0 0 10px" },
  sectionSub: { color:T.textMuted, fontSize:"1rem" },
  catGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:"16px" },
  catCard: { background:T.bg, borderRadius:T.radiusLg, padding:"24px 16px", textAlign:"center", cursor:"pointer", border:`1px solid ${T.border}`, transition:"all 0.15s" },
  catIcon: { fontSize:"2.2rem", marginBottom:"10px" },
  catLabel: { fontWeight:"700", color:T.text, fontSize:"0.95rem", marginBottom:"4px" },
  catDesc: { color:T.textMuted, fontSize:"0.78rem" },
  stepsGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:"24px", position:"relative" },
  stepCard: { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:T.radiusLg, padding:"24px 20px" },
  stepNum: { width:"40px", height:"40px", borderRadius:"10px", background:T.primary, color:"#fff", fontWeight:"800", fontSize:"0.9rem", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"14px" },
  stepLine: {},
  stepTitle: { color:"#e2e8f0", fontWeight:"700", fontSize:"1rem", marginBottom:"8px" },
  stepDesc: { color:"#64748b", fontSize:"0.85rem", lineHeight:1.6 },
  footer: { background:T.sidebarBg, padding:"22px 40px", display:"flex", gap:"16px", alignItems:"center", flexWrap:"wrap", justifyContent:"center" },
  footerBrand: { color:T.primary, fontWeight:"800", fontSize:"1.05rem" },
  footerText: { color:"#475569", fontSize:"0.82rem" },
};
