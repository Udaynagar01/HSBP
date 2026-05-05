import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { T } from "../theme";

export default function PublicNav() {
  const { user } = useAuth();

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.brand}>🔧 <span style={s.brandText}>HSBP</span></Link>
      <div style={s.links}>
        <Link to="/services" style={s.link}>Services</Link>
        {!user ? (
          <>
            <Link to="/login" style={s.link}>Login</Link>
            <Link to="/register" style={s.registerBtn}>Get Started →</Link>
          </>
        ) : (
          <>
            <Link to={user.role === "admin" ? "/admin" : user.role === "provider" ? "/provider/bookings" : "/dashboard"} style={s.dashLink}>
              Go to Dashboard →
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const s = {
  nav: { position:"sticky", top:0, zIndex:100, background:"rgba(15,23,42,0.95)", backdropFilter:"blur(8px)", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 40px", height:"60px" },
  brand: { display:"flex", alignItems:"center", gap:"6px", textDecoration:"none", color:"#fff", fontWeight:"800", fontSize:"1.25rem" },
  brandText: { color:T.primary },
  links: { display:"flex", alignItems:"center", gap:"24px" },
  link: { color:"#94a3b8", textDecoration:"none", fontSize:"0.9rem", fontWeight:"500" },
  registerBtn: { padding:"8px 18px", background:T.primary, color:"#fff", borderRadius:"8px", textDecoration:"none", fontSize:"0.88rem", fontWeight:"600" },
  dashLink: { padding:"8px 18px", background:T.primaryLight, color:T.primary, borderRadius:"8px", textDecoration:"none", fontSize:"0.88rem", fontWeight:"600" },
};
