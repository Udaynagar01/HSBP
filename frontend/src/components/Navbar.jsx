import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>🔧 HSBP</Link>

      {/* Desktop links */}
      <div style={styles.links}>
        {!user && (
          <>
            <Link to="/services" style={styles.link}>Services</Link>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.registerBtn}>Register</Link>
          </>
        )}
        {user?.role === "user" && (
          <>
            <Link to="/services" style={styles.link}>Services</Link>
            <Link to="/dashboard" style={styles.link}>My Bookings</Link>
          </>
        )}
        {user?.role === "provider" && (
          <>
            <Link to="/provider/services" style={styles.link}>My Services</Link>
            <Link to="/provider/bookings" style={styles.link}>Bookings</Link>
          </>
        )}
        {user?.role === "admin" && (
          <Link to="/admin" style={styles.link}>Admin Panel</Link>
        )}
        {user && (
          <div style={styles.userMenu}>
            <button style={styles.avatarBtn} onClick={() => setMenuOpen(!menuOpen)}>
              <span style={styles.avatarCircle}>{user.name?.charAt(0).toUpperCase()}</span>
              <span style={styles.userName}>{user.name}</span>
              <span style={{ color: "#aaa", fontSize: "0.75rem" }}>▾</span>
            </button>
            {menuOpen && (
              <div style={styles.dropdown}>
                <Link to="/profile" style={styles.dropItem} onClick={() => setMenuOpen(false)}>👤 Profile</Link>
                <div style={styles.dropDivider} />
                <button style={styles.dropItemBtn} onClick={handleLogout}>🚪 Logout</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile hamburger */}
      <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>☰</button>

      {/* Mobile drawer */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/services" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Services</Link>
          {!user && <>
            <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Register</Link>
          </>}
          {user?.role === "user" && <Link to="/dashboard" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Bookings</Link>}
          {user?.role === "provider" && <>
            <Link to="/provider/services" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Services</Link>
            <Link to="/provider/bookings" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Bookings</Link>
          </>}
          {user?.role === "admin" && <Link to="/admin" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Admin Panel</Link>}
          {user && <>
            <Link to="/profile" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Profile</Link>
            <button style={styles.mobileLinkBtn} onClick={handleLogout}>Logout</button>
          </>}
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "0 32px", backgroundColor: "#1a1a2e", color: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)", position: "sticky", top: 0,
    zIndex: 200, minHeight: "60px", flexWrap: "wrap",
  },
  brand: { color: "#e94560", fontWeight: "bold", fontSize: "1.4rem", textDecoration: "none", padding: "14px 0" },
  links: { display: "flex", alignItems: "center", gap: "20px" },
  link: { color: "#ccc", textDecoration: "none", fontSize: "0.93rem" },
  registerBtn: {
    background: "#e94560", color: "#fff", textDecoration: "none",
    padding: "7px 16px", borderRadius: "6px", fontSize: "0.88rem", fontWeight: "bold",
  },
  userMenu: { position: "relative" },
  avatarBtn: {
    display: "flex", alignItems: "center", gap: "8px",
    background: "none", border: "none", cursor: "pointer", color: "#ccc", padding: "8px 0",
  },
  avatarCircle: {
    width: "32px", height: "32px", borderRadius: "50%",
    background: "#e94560", color: "#fff", fontSize: "0.9rem", fontWeight: "bold",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  userName: { color: "#ccc", fontSize: "0.9rem" },
  dropdown: {
    position: "absolute", right: 0, top: "46px", background: "#fff",
    borderRadius: "10px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    minWidth: "160px", zIndex: 300, overflow: "hidden",
  },
  dropItem: { display: "block", padding: "12px 16px", color: "#333", textDecoration: "none", fontSize: "0.9rem" },
  dropDivider: { height: "1px", background: "#f0f2f5" },
  dropItemBtn: {
    display: "block", width: "100%", padding: "12px 16px", textAlign: "left",
    background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: "0.9rem",
  },
  hamburger: {
    display: "none", background: "none", border: "none",
    color: "#fff", fontSize: "1.5rem", cursor: "pointer",
    "@media (max-width: 640px)": { display: "block" },
  },
  mobileMenu: {
    display: "none", flexDirection: "column", width: "100%",
    background: "#16213e", padding: "8px 0 16px",
  },
  mobileLink: { color: "#ccc", textDecoration: "none", padding: "12px 32px", fontSize: "0.95rem", display: "block" },
  mobileLinkBtn: {
    background: "none", border: "none", color: "#e94560",
    padding: "12px 32px", fontSize: "0.95rem", textAlign: "left", cursor: "pointer", width: "100%",
  },
};
