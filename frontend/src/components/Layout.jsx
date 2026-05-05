import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { T } from "../theme";

const NAV = {
  user: [
    { icon: "🏠", label: "Home",        path: "/" },
    { icon: "🔧", label: "Services",    path: "/services" },
    { icon: "📦", label: "My Bookings", path: "/dashboard" },
    { icon: "👤", label: "Profile",     path: "/profile" },
  ],
  provider: [
    { icon: "🏠", label: "Home",            path: "/" },
    { icon: "🔧", label: "Browse Services", path: "/services" },
    { icon: "🛠️", label: "My Services",    path: "/provider/services" },
    { icon: "📋", label: "Bookings",        path: "/provider/bookings" },
    { icon: "📦", label: "Booked by Me",    path: "/dashboard" },
    { icon: "👤", label: "Profile",         path: "/profile" },
  ],
  admin: [
    { icon: "⚙️", label: "Admin Panel", path: "/admin" },
    { icon: "👤", label: "Profile",      path: "/profile" },
  ],
};

const ROLE_LABELS = { user: "Customer", provider: "Provider", admin: "Administrator" };

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = NAV[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Plain function — NOT a React component — avoids remount-on-render bug
  const renderSidebarContent = () => (
    <div style={st.sidebarInner}>
      {/* Logo */}
      <div style={st.logo}>
        <span style={st.logoIcon}>🔧</span>
        {!collapsed && <span style={st.logoText}>HSBP</span>}
      </div>

      {/* User info */}
      {!collapsed ? (
        <div style={st.roleBadge}>
          <div style={st.avatarCircle}>{user?.name?.charAt(0).toUpperCase()}</div>
          <div style={{ overflow: "hidden" }}>
            <div style={st.userName}>{user?.name}</div>
            <div style={st.userRole}>{ROLE_LABELS[user?.role]}</div>
          </div>
        </div>
      ) : (
        <div style={{ ...st.avatarCircle, margin: "12px auto" }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      )}

      <div style={st.divider} />

      {/* Nav links */}
      <nav style={st.nav}>
        {navItems.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : ""}
              style={{ ...st.navItem, ...(active ? st.navItemActive : {}) }}
            >
              <span style={st.navIcon}>{item.icon}</span>
              {!collapsed && <span style={st.navLabel}>{item.label}</span>}
              {active && !collapsed && <span style={st.activeDot} />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={st.bottomSection}>
        <div style={st.divider} />
        <button
          title={collapsed ? "Logout" : ""}
          style={{ ...st.navItem, ...st.logoutItem, width: "100%", border: "none", cursor: "pointer" }}
          onClick={handleLogout}
        >
          <span style={st.navIcon}>🚪</span>
          {!collapsed && <span style={st.navLabel}>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div style={st.shell}>
      {/* Mobile overlay */}
      {mobileOpen && <div style={st.overlay} onClick={() => setMobileOpen(false)} />}

      {/* Desktop sidebar */}
      <aside style={{ ...st.sidebar, width: collapsed ? "68px" : "240px" }}>
        {renderSidebarContent()}
        <button style={st.collapseBtn} onClick={() => setCollapsed(!collapsed)} title="Toggle sidebar">
          {collapsed ? "▶" : "◀"}
        </button>
      </aside>

      {/* Mobile sidebar */}
      <aside style={{ ...st.mobileSidebar, transform: mobileOpen ? "translateX(0)" : "translateX(-100%)" }}>
        {renderSidebarContent()}
      </aside>

      {/* Main */}
      <div style={{ ...st.main, marginLeft: collapsed ? "68px" : "240px" }}>
        <header style={st.header}>
          <button style={st.hamburger} onClick={() => setMobileOpen(true)}>☰</button>
          <span style={st.breadcrumb}>
            {navItems.find((n) => n.path === pathname)?.label || "Dashboard"}
          </span>
          <div style={st.headerRight}>
            <Link to="/profile" style={st.headerAvatar} title="Profile">
              {user?.name?.charAt(0).toUpperCase()}
            </Link>
          </div>
        </header>
        <main style={st.content}>{children}</main>
      </div>
    </div>
  );
}

const st = {
  shell: { display: "flex", minHeight: "100vh", background: T.bg },

  sidebar: {
    position: "fixed", top: 0, left: 0, height: "100vh",
    background: T.sidebarBg, display: "flex", flexDirection: "column",
    transition: "width 0.22s ease", zIndex: 100, overflow: "hidden",
    flexShrink: 0,
  },
  mobileSidebar: {
    position: "fixed", top: 0, left: 0, height: "100vh", width: "240px",
    background: T.sidebarBg, zIndex: 400,
    transform: "translateX(-100%)", transition: "transform 0.25s ease",
    display: "flex", flexDirection: "column",
  },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 350 },

  sidebarInner: { display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" },

  logo:     { display: "flex", alignItems: "center", gap: "10px", padding: "20px 16px 12px", flexShrink: 0 },
  logoIcon: { fontSize: "1.5rem", flexShrink: 0 },
  logoText: { color: "#fff", fontWeight: "800", fontSize: "1.2rem", letterSpacing: "0.5px", whiteSpace: "nowrap" },

  roleBadge:  { display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px 14px", flexShrink: 0, overflow: "hidden" },
  avatarCircle: {
    width: "36px", height: "36px", borderRadius: "50%",
    background: T.primary, color: "#fff", fontWeight: "bold", fontSize: "0.95rem",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  userName: { color: "#e2e8f0", fontSize: "0.88rem", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userRole: { color: "#94a3b8", fontSize: "0.75rem", marginTop: "1px" },

  divider: { height: "1px", background: "rgba(255,255,255,0.07)", margin: "4px 14px", flexShrink: 0 },

  nav: { display: "flex", flexDirection: "column", gap: "2px", padding: "8px", flex: 1, overflowY: "auto" },
  navItem: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "10px", borderRadius: "8px",
    color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem",
    background: "none", transition: "background 0.15s, color 0.15s",
  },
  navItemActive: { background: "rgba(99,102,241,0.2)", color: "#a5b4fc" },
  navIcon:  { fontSize: "1.1rem", width: "22px", textAlign: "center", flexShrink: 0 },
  navLabel: { fontWeight: "500", flex: 1, whiteSpace: "nowrap" },
  activeDot:{ width: "5px", height: "5px", borderRadius: "50%", background: T.primary, marginLeft: "auto", flexShrink: 0 },

  bottomSection: { marginTop: "auto", paddingBottom: "12px", flexShrink: 0 },
  logoutItem:    { color: "#f87171" },

  collapseBtn: {
    position: "absolute", bottom: "14px", right: "8px",
    background: "rgba(255,255,255,0.08)", border: "none",
    color: "#94a3b8", borderRadius: "6px", padding: "4px 8px",
    cursor: "pointer", fontSize: "0.75rem",
  },

  main: { flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.22s ease", minHeight: "100vh", minWidth: 0 },
  header: {
    background: T.cardBg, borderBottom: `1px solid ${T.border}`,
    padding: "0 24px", height: "60px", display: "flex",
    alignItems: "center", gap: "16px",
    position: "sticky", top: 0, zIndex: 50,
    boxShadow: T.shadow, flexShrink: 0,
  },
  hamburger: {
    background: "none", border: "none",
    fontSize: "1.3rem", cursor: "pointer", color: T.text, padding: "4px",
    display: "none",
  },
  breadcrumb:  { fontWeight: "600", color: T.text, fontSize: "1rem", flex: 1 },
  headerRight: { display: "flex", alignItems: "center", gap: "12px" },
  headerAvatar: {
    width: "34px", height: "34px", borderRadius: "50%",
    background: T.primary, color: "#fff", fontWeight: "bold", fontSize: "0.9rem",
    display: "flex", alignItems: "center", justifyContent: "center",
    textDecoration: "none",
  },
  content: { flex: 1, padding: "28px" },
};
