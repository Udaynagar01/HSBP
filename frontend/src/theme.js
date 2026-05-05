export const T = {
  primary:      "#6366f1",
  primaryDark:  "#4f46e5",
  primaryLight: "#e0e7ff",
  primaryText:  "#ffffff",

  sidebarBg:    "#0f172a",
  sidebarHover: "#1e293b",
  sidebarActive:"#6366f1",

  bg:           "#f1f5f9",
  cardBg:       "#ffffff",
  border:       "#e2e8f0",

  text:         "#1e293b",
  textMuted:    "#64748b",
  textLight:    "#94a3b8",

  success:      "#22c55e",
  successBg:    "#dcfce7",
  danger:       "#ef4444",
  dangerBg:     "#fee2e2",
  warning:      "#f59e0b",
  warningBg:    "#fef3c7",
  info:         "#3b82f6",
  infoBg:       "#dbeafe",

  shadow:       "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
  shadowMd:     "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)",
  shadowLg:     "0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)",

  radius:       "10px",
  radiusLg:     "14px",
};

export const statusColor = (s) => ({
  pending:   T.warning,
  accepted:  T.info,
  completed: T.success,
  cancelled: T.danger,
}[s] || T.textMuted);

export const roleColor = (r) => ({
  user:     T.info,
  provider: T.success,
  admin:    T.primary,
}[r] || T.textMuted);
