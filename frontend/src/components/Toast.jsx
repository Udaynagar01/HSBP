import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div style={styles.container}>
        {toasts.map((t) => (
          <div key={t.id} style={{ ...styles.toast, ...typeStyles[t.type] }}>
            <span style={styles.icon}>{typeIcons[t.type]}</span>
            <span style={styles.msg}>{t.message}</span>
            <button style={styles.close} onClick={() => removeToast(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const typeStyles = {
  success: { background: "#1e8449", borderLeft: "4px solid #27ae60" },
  error:   { background: "#922b21", borderLeft: "4px solid #e74c3c" },
  info:    { background: "#1a5276", borderLeft: "4px solid #2980b9" },
  warning: { background: "#7d6608", borderLeft: "4px solid #f39c12" },
};

const typeIcons = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" };

const styles = {
  container: {
    position: "fixed", bottom: "24px", right: "24px",
    display: "flex", flexDirection: "column", gap: "10px", zIndex: 9999,
    maxWidth: "340px", width: "100%",
  },
  toast: {
    display: "flex", alignItems: "center", gap: "10px",
    padding: "12px 16px", borderRadius: "8px", color: "#fff",
    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
    animation: "slideIn 0.25s ease",
  },
  icon: { fontSize: "1rem", flexShrink: 0 },
  msg: { flex: 1, fontSize: "0.9rem", lineHeight: 1.4 },
  close: {
    background: "none", border: "none", color: "rgba(255,255,255,0.7)",
    cursor: "pointer", fontSize: "0.85rem", flexShrink: 0, padding: "2px",
  },
};
