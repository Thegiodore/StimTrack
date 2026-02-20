import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function AuthGate({ children }) {
  const [status, setStatus] = useState("loading"); // loading | authed | unauthed
  const [role, setRole] = useState(null);

  useEffect(() => {
    fetch("/api/auth/status", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setRole(data.user?.role || null);
          setStatus("authed");
        } else {
          setStatus("unauthed");
        }
      })
      .catch(() => setStatus("unauthed"));
  }, []);

  if (status === "loading") return null;

  if (status === "authed") {
    return <Navigate to={role === "admin" ? "/Admin" : "/Dashboard"} replace />;
  }

  return children;
}