import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sun, Moon, LogOut, Trash2, Shield, Users } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [logoutExpanded, setLogoutExpanded] = useState(false);

  const loadUsers = async () => {
    setLoading(true);

    const statusRes = await fetch("/api/auth/status", {
      credentials: "include",
    });

    if (!statusRes.ok) {
      navigate("/Login");
      return;
    }

    const statusData = await statusRes.json();
    setMe(statusData.user);

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">

      {/* TOP BAR */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-slate-800 rounded-xl text-indigo-600 dark:text-indigo-400 transition-colors duration-300">
              <Brain size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white transition-colors duration-300">
                StimTrack
              </h1>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Admin Panel
              </p>
            </div>
          </div>

          {/* Right: Dark Mode + Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Desktop: single-click logout */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-300"
            >
              <LogOut size={16} />
              Logout
            </button>

            {/* Mobile: two-step logout */}
            <motion.button
              layout
              onClick={() => {
                if (logoutExpanded) {
                  handleLogout();
                } else {
                  setLogoutExpanded(true);
                  setTimeout(() => setLogoutExpanded(false), 3000);
                }
              }}
              className="flex sm:hidden items-center px-2.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors duration-300 overflow-hidden"
              transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
            >
              <motion.span layout="position"><LogOut size={16} className="shrink-0" /></motion.span>
              <AnimatePresence>
                {logoutExpanded && (
                  <motion.span
                    initial={{ width: 0, opacity: 0, paddingLeft: 0 }}
                    animate={{ width: "auto", opacity: 1, paddingLeft: 8 }}
                    exit={{ width: 0, opacity: 0, paddingLeft: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <Shield size={24} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white transition-colors duration-300">
              Admin Dashboard
            </h2>
          </div>
          {me && (
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium ml-[36px] transition-colors">
              Logged in as <span className="font-bold text-slate-700 dark:text-slate-300">{me.email}</span> ({me.role})
            </p>
          )}
        </motion.div>

        {/* Users Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden transition-colors duration-300"
        >
          {/* Section Header */}
          <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white transition-colors">User Management</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {users.length} registered {users.length === 1 ? "user" : "users"}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="px-8 py-16 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* MOBILE: Card Layout */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u, index) => (
                  <motion.div
                    key={u.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: index * 0.03 }}
                    className="px-5 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">
                            {u.username}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border shrink-0 ${u.role === "admin"
                            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                            }`}>
                            {u.role === "admin" && <Shield size={8} />}
                            {u.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{u.email}</p>
                        <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1 truncate">ID: {u.id}</p>
                      </div>

                      <div className="shrink-0">
                        {u.role === "admin" ? (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">
                            protected
                          </span>
                        ) : (
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 active:bg-red-100 dark:active:bg-red-500/20 transition-all duration-200"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* DESKTOP: Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-left">
                      <th className="px-8 py-3.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Username</th>
                      <th className="px-4 py-3.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-8 py-3.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {users.map((u, index) => (
                        <motion.tr
                          key={u.id}
                          variants={itemVariants}
                          initial="hidden"
                          animate="show"
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="px-8 py-4 text-xs font-mono text-slate-400 dark:text-slate-500">
                            {u.id}
                          </td>
                          <td className="px-4 py-4 font-semibold text-slate-800 dark:text-slate-200 text-sm">
                            {u.username}
                          </td>
                          <td className="px-4 py-4 text-slate-500 dark:text-slate-400 text-sm">
                            {u.email}
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${u.role === "admin"
                              ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                              }`}>
                              {u.role === "admin" && <Shield size={10} />}
                              {u.role}
                            </span>
                          </td>
                          <td className="px-8 py-4 text-right">
                            {u.role === "admin" ? (
                              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium italic">
                                protected
                              </span>
                            ) : (
                              <button
                                onClick={() => deleteUser(u.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-200"
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6 font-medium"
        >
          In-memory storage — restarting backend resets non-admin users.
        </motion.p>
      </main>
    </div>
  );
}