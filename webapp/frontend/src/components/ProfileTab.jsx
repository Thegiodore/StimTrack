import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Smile, Heart, Plus, ArrowLeft, UserRound } from "lucide-react";

const STORAGE_KEYS = {
  caregiverRole: (userId) => `stimtrack_caregiver_role_${userId}`,
  childProfile: (userId) => `stimtrack_child_profile_${userId}`,
};

const ProfileTab = ({ me }) => {
  const userId = me?.id || "guest";
  const displayName = me?.username || "User";

  // caregiver role
  const [role, setRole] = useState("Parent"); // default Parent
  const [isEditing, setIsEditing] = useState(false);

  // child profile
  const [child, setChild] = useState(null);
  const [addingChild, setAddingChild] = useState(false);
  const [childForm, setChildForm] = useState({ name: "", age: "" });

  // change password (UI only for now)
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const initials = useMemo(() => {
    const parts = displayName.trim().split(/\s+/);
    const a = parts[0]?.[0] || "U";
    const b = parts[1]?.[0] || "";
    return (a + b).toUpperCase();
  }, [displayName]);

  // load from localStorage (per-user)
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem(STORAGE_KEYS.caregiverRole(userId));
      if (savedRole) setRole(savedRole);

      const savedChild = localStorage.getItem(STORAGE_KEYS.childProfile(userId));
      if (savedChild) setChild(JSON.parse(savedChild));
    } catch {
      // ignore storage errors
    }
  }, [userId]);

  // persist role
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.caregiverRole(userId), role);
    } catch {
      // ignore
    }
  }, [role, userId]);

  const saveChild = () => {
    if (!childForm.name.trim() || !String(childForm.age).trim()) {
      alert("Please enter child name and age.");
      return;
    }

    const newChild = {
      name: childForm.name.trim(),
      age: String(childForm.age).trim(),
      monitored: true,
    };

    setChild(newChild);
    setAddingChild(false);
    setChildForm({ name: "", age: "" });

    try {
      localStorage.setItem(STORAGE_KEYS.childProfile(userId), JSON.stringify(newChild));
    } catch {
      // ignore
    }
  };

  const cancelAddChild = () => {
    setAddingChild(false);
    setChildForm({ name: "", age: "" });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();

    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      alert("Please complete all password fields.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }

    // UI-only for now. Later: call backend endpoint
    alert("Password change saved (UI only for now).");

    setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setIsEditing(false);
  };

  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl items-start"
    >
      {/* CHILD PROFILE CARD */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group transition-colors duration-300">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Smile size={120} className="text-indigo-500" />
        </div>

        <div className="relative z-10">
          {/* header + add button */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">
                Child Profile
              </h3>
            </div>

            {!addingChild && (
              <button
                onClick={() => setAddingChild(true)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl
                  bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400
                  hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                title="Add child profile"
              >
                <Plus size={18} className="stroke-[2.5px]" />
              </button>
            )}
          </div>

          {/* Add child form */}
          {addingChild ? (
            <div className="mt-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
                Add Child
              </h2>

              <div className="space-y-3">
                <input
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none
                    text-slate-900 dark:text-slate-100"
                  placeholder="Child Name"
                  value={childForm.name}
                  onChange={(e) => setChildForm((p) => ({ ...p, name: e.target.value }))}
                />

                <input
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none
                    text-slate-900 dark:text-slate-100"
                  placeholder="Age"
                  inputMode="numeric"
                  value={childForm.age}
                  onChange={(e) => setChildForm((p) => ({ ...p, age: e.target.value }))}
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={saveChild}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors"
                >
                  Save
                </button>

                <button
                  onClick={cancelAddChild}
                  className="flex items-center justify-center w-12 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Cancel"
                >
                  <ArrowLeft size={18} />
                </button>
              </div>
            </div>
          ) : child ? (
            <>
              <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center mb-6 text-2xl">
                👦
              </div>

              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 transition-colors">
                {child.name}
              </h2>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-medium transition-colors">
                {child.age} Years Old
              </p>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                  Current Status
                </h4>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-full text-sm font-bold border border-green-100 dark:border-green-500/20">
                  <Activity size={14} /> Active Monitoring
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center mb-6 text-2xl">
                👦
              </div>

              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 transition-colors">
                No child profile yet
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">
                Add the child being monitored by the AI.
              </p>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setAddingChild(true)}
                  className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40
                    text-indigo-700 dark:text-indigo-300 font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-2"
                >
                  <Plus size={18} className="stroke-[2.5px]" />
                  Add Child Profile
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CAREGIVER PROFILE CARD (FLIP: no stretching + scrollable back) */}
      <div className="relative [perspective:1200px]">
        <motion.div
          animate={{ rotateY: isEditing ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="relative w-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* FRONT */}
          <div
            className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group transition-colors duration-300"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              pointerEvents: isEditing ? "none" : "auto",
            }}
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Heart size={120} className="text-pink-500" />
            </div>

            <div className="relative z-10">
              <div className="w-24 h-24 rounded-full bg-pink-50 dark:bg-pink-500/10 border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center mb-6 text-2xl font-black text-pink-500">
                {initials}
              </div>

              <h3 className="text-sm font-bold text-pink-500 uppercase tracking-widest mb-1">
                {role}
              </h3>

              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 transition-colors">
                {displayName}
              </h2>

              <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors inline-flex items-center gap-2">
                <UserRound size={16} />
                ID: {userId}
              </p>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700
                    text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* BACK */}
          <div
            className="absolute inset-0 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl transition-colors duration-300"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              pointerEvents: isEditing ? "auto" : "none",
            }}
          >
            {/* Scrollable area so it won't change tile size */}
            <div className="h-full overflow-y-auto pr-1">
              <div className="flex items-center justify-between gap-3 mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Edit Profile
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700
                    text-slate-700 dark:text-slate-200 font-bold transition-colors"
                >
                  Done
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none
                    text-slate-900 dark:text-slate-100"
                >
                  <option value="Parent">Parent</option>
                  <option value="Caregiver">Caregiver</option>
                </select>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Default is Parent. This can be changed anytime.
                </p>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  Change Password
                </label>

                <input
                  type="password"
                  placeholder="Current password"
                  value={pwForm.currentPassword}
                  onChange={(e) =>
                    setPwForm((p) => ({ ...p, currentPassword: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none
                    text-slate-900 dark:text-slate-100"
                />

                <input
                  type="password"
                  placeholder="New password"
                  value={pwForm.newPassword}
                  onChange={(e) =>
                    setPwForm((p) => ({ ...p, newPassword: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none
                    text-slate-900 dark:text-slate-100"
                />

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={pwForm.confirmPassword}
                  onChange={(e) =>
                    setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none
                    text-slate-900 dark:text-slate-100"
                />

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold transition-colors"
                >
                  Save Password
                </button>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Note: This is UI-only for now. We will connect this to the backend later.
                </p>
              </form>

              <div className="h-2" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfileTab;