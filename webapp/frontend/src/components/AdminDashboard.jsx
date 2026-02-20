import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null); // logged in user info

  const loadUsers = async () => {
    setLoading(true);

    // Check auth status first
    const statusRes = await fetch("/api/auth/status", {
      credentials: "include",
    });

    if (!statusRes.ok) {
      navigate("/Login");
      return;
    }

    const statusData = await statusRes.json();
    setMe(statusData.user);

    // Now load admin users
    const res = await fetch("/api/Admin/Users", {
      credentials: "include",
    });

    if (res.status === 401) {
      navigate("/Login");
      return;
    }

    if (res.status === 403) {
      alert("Admin only.");
      navigate("/Dashboard");
      return;
    }

    const data = await res.json().catch(() => ({}));
    setUsers(data.users || []);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteUser = async (id) => {
    const ok = confirm("Delete this user?");
    if (!ok) return;

    const res = await fetch(`/api/Admin/Users/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data.message || "Delete failed");
      return;
    }

    loadUsers();
  };

  const handleLogout = async () => {
    await fetch("/api/Logout", {
      method: "POST",
      credentials: "include",
    });
    navigate("/Login");
  };

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2>Admin Dashboard</h2>
          {me && (
            <p style={{ margin: 0, color: "#666" }}>
              Logged in as: <strong>{me.email}</strong> ({me.role})
            </p>
          )}
        </div>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <p style={{ color: "#666" }}>
        Manage accounts (in-memory). Restarting backend resets non-admin users.
      </p>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th style={{ width: 120 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  {u.role === "admin" ? (
                    <em>protected</em>
                  ) : (
                    <button onClick={() => deleteUser(u.id)}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}