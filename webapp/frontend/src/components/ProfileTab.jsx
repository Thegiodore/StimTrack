import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Smile, Heart, Plus, Camera, UserRound, Pencil, ChevronDown, Check } from "lucide-react";
import Popup from "./Popup";



/* Desktop: overlay slides down from top */
const overlayVariants = {
  initial: { y: "-100%", opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { y: "-100%", opacity: 0, transition: { duration: 0.25, ease: "easeIn" } },
};

/* Mobile: expand downward */
const expandVariants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1, transition: { type: "spring", stiffness: 300, damping: 28 } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

import { useNavigate } from "react-router-dom";

// Standardized Custom Select Component
const SelectDropdown = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none flex items-center justify-between text-left transition-all hover:bg-slate-100 dark:hover:bg-slate-800/80 focus:ring-2 focus:ring-indigo-500/50"
      >
        <span className={`block truncate ${!value ? "text-slate-400 font-medium" : "text-slate-900 dark:text-slate-100 font-bold"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden origin-top"
          >
            <div className="max-h-60 overflow-y-auto p-2 space-y-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${value === option.value
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}
                >
                  {option.label}
                  {value === option.value && <Check size={16} className="text-indigo-600 dark:text-indigo-400" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProfileTab = ({ me, onChildSetupCancel, onChildUpdated, onCaregiverUpdated }) => {
  const userId = me?.id || "guest";
  const [localName, setLocalName] = useState(me?.username || "User");
  const navigate = useNavigate();

  const [popup, setPopup] = useState({ isOpen: false });
  const showAlert = (type, title, message, onConfirmCallback) => {
    setPopup({
      isOpen: true,
      type,
      title,
      message,
      onConfirm: () => {
        setPopup({ isOpen: false });
        if (onConfirmCallback) onConfirmCallback();
      }
    });
  };

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const [role, setRole] = useState("Parent");
  const [caregiverName, setCaregiverName] = useState("");
  const [originalCaregiver, setOriginalCaregiver] = useState({ name: "", role: "Parent" });
  const [isEditing, setIsEditing] = useState(false);

  const [child, setChild] = useState(null);
  const [addingChild, setAddingChild] = useState(false);
  const [childForm, setChildForm] = useState({ name: "", age: "", gender: "", notes: "" });
  const [childPhoto, setChildPhoto] = useState(null);
  const fileInputRef = useRef(null);

  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const initials = useMemo(() => {
    const parts = localName.trim().split(/\s+/);
    const a = parts[0]?.[0] || "U";
    const b = parts[1]?.[0] || "";
    return (a + b).toUpperCase();
  }, [localName]);

  useEffect(() => {
    if (userId === "guest") return;
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/Profile", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setRole(data.profile.caregiverRole || "Parent");
          setCaregiverName(data.profile.caregiverName || "");
          setOriginalCaregiver({ name: data.profile.caregiverName || "", role: data.profile.caregiverRole || "Parent" });
          if (data.profile.child) {
            setChild(data.profile.child);
            if (data.profile.child.photo) setChildPhoto(data.profile.child.photo);
          }
          if (data.username) setLocalName(data.username);
        }
      } catch (err) { }
    }
    fetchProfile();
  }, [userId]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setChildPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const openEditChild = () => {
    if (child) {
      setChildForm({ name: child.name || "", age: child.age || "", gender: child.gender || "", notes: child.notes || "" });
      if (child.photo) setChildPhoto(child.photo);
    } else {
      setChildForm({ name: "", age: "", gender: "", notes: "" });
    }
    setIsEditing(false); // close other card
    setAddingChild(true);
  };

  const saveChild = async () => {
    if (!childForm.name.trim() || !String(childForm.age).trim() || !childForm.gender.trim()) {
      showAlert("warning", "Incomplete Form", "Please enter child name, age, and gender.");
      return;
    }

    const formattedName = childForm.name.trim();
    const capitalizedName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);

    const newChild = {
      name: capitalizedName,
      age: String(childForm.age).trim(),
      gender: childForm.gender.trim(),
      notes: childForm.notes.trim(),
      photo: childPhoto,
      monitored: true,
    };
    try {
      const res = await fetch("/api/Profile/Child", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ child: newChild })
      });
      if (res.ok) {
        setChild(newChild);
        setAddingChild(false);
        setChildForm({ name: "", age: "", gender: "", notes: "" });
        if (onChildUpdated) onChildUpdated(capitalizedName);
      } else {
        showAlert("error", "Save Failed", "Failed to save child profile");
      }
    } catch {
      showAlert("error", "Network Error", "A network error occurred.");
    }
  };

  const cancelAddChild = () => {
    setAddingChild(false);
    if (child) {
      setChildForm({ name: child.name || "", age: child.age || "", gender: child.gender || "", notes: child.notes || "" });
      setChildPhoto(child.photo || null);
    } else {
      setChildForm({ name: "", age: "", gender: "", notes: "" });
      setChildPhoto(null);
    }
    if (!child || !child.name) {
      if (onChildSetupCancel) {
        setTimeout(() => onChildSetupCancel(), 400);
      }
    }
  };

  const cancelEditProfile = () => {
    setIsEditing(false);
    setCaregiverName(originalCaregiver.name);
    setRole(originalCaregiver.role);
    setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      showAlert("warning", "Incomplete Form", "Please complete all password fields."); return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showAlert("error", "Mismatch", "New password and confirm password do not match."); return;
    }
    try {
      const res = await fetch("/api/Profile/Password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword
        })
      });
      const data = await res.json();

      if (data.ok) {
        showAlert("success", "Success", data.message || "Password changed! Please log in with your new password.", async () => {
          setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
          setIsEditing(false);
          await fetch("/api/Logout", { method: "POST", credentials: "include" });
          navigate("/Login");
        });
      } else {
        showAlert("error", "Failed", data.message || "Failed to change password");
      }
    } catch (err) {
      showAlert("error", "Error", "Error changing password");
    }
  };

  const handleSaveCaregiver = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/Profile/Caregiver", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ caregiverRole: role, caregiverName })
      });
      if (res.ok) {
        if (onCaregiverUpdated) onCaregiverUpdated(caregiverName, role);
        setOriginalCaregiver({ name: caregiverName, role });
        showAlert("success", "Saved", "Details saved successfully", () => setIsEditing(false));
      } else {
        showAlert("error", "Failed", "Failed to save details");
      }
    } catch {
      showAlert("error", "Network Error", "A network error occurred.");
    }
  };

  /* ─── Shared edit form content ─── */
  const childEditContent = (
    <>
      <div className="flex items-center justify-between gap-3 mb-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          {child ? "Edit Child" : "Add Child"}
        </h3>
        <button onClick={cancelAddChild} className="px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-colors">
          Cancel
        </button>
      </div>

      {/* Photo Upload */}
      <div className="flex justify-center mb-6">
        <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors overflow-hidden relative group">
          {childPhoto ? (
            <>
              <img src={childPhoto} alt="Child" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-indigo-400">
              <Camera size={24} />
              <span className="text-[10px] font-bold uppercase">Upload</span>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Child Name</label>
        <input className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-slate-100" placeholder="Enter child's name" value={childForm.name} onChange={(e) => setChildForm((p) => ({ ...p, name: e.target.value }))} />

        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Age</label>
        <input className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-slate-100" placeholder="Enter age" inputMode="numeric" value={childForm.age} onChange={(e) => setChildForm((p) => ({ ...p, age: e.target.value.replace(/\D/g, "") }))} />

        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Gender</label>
        <SelectDropdown
          value={childForm.gender}
          onChange={(val) => setChildForm((p) => ({ ...p, gender: val }))}
          placeholder="Select gender"
          options={[
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
          ]}
        />
      </div>

      <div className="mt-6">
        <button onClick={saveChild} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors">Save</button>
      </div>
    </>
  );

  const userEditContent = (
    <>
      <div className="flex items-center justify-between gap-3 mb-6">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">Edit Profile</h3>
        <button onClick={cancelEditProfile} className="px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-colors">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSaveCaregiver} className="mb-6 space-y-3">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Full Name</label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={caregiverName}
          onChange={(e) => setCaregiverName(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-slate-100"
        />
        <p className="text-xs text-slate-500 font-medium ml-1">
          The full name will appear on the Activity Report Logs. Please provide the complete name.
        </p>

        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 pt-2">Role</label>
        <SelectDropdown
          value={role}
          onChange={setRole}
          placeholder="Select role"
          options={[
            { value: "Parent", label: "Parent" },
            { value: "Caregiver", label: "Caregiver" },
          ]}
        />
        <p className="text-xs text-slate-500 font-medium ml-1">
          This role will be displayed next to your name on generated reports.
        </p>
        <button type="submit" className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors mt-2">Save Details</button>
      </form>

      <form onSubmit={handlePasswordChange} className="space-y-3 pt-6 border-t border-slate-200 dark:border-slate-700">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Change Password</label>
        <input type="password" placeholder="Current password" value={pwForm.currentPassword} onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-slate-100" />
        <input type="password" placeholder="New password" value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-slate-100" />
        <input type="password" placeholder="Confirm new password" value={pwForm.confirmPassword} onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-slate-100" />
        <button type="submit" className="w-full py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold transition-colors">Update Password</button>
      </form>
    </>
  );

  return (
    <>
      <Popup {...popup} />
      <motion.div
        key="profile"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start"
      >
        {/* ═══════════ CHILD PROFILE CARD ═══════════ */}
        <div className="tour-add-child relative">
          {/* Desktop: overlay container */}
          <motion.div
            animate={{ height: isDesktop && addingChild ? 600 : 455 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative md:rounded-[2rem] md:overflow-hidden"
          >
            {/* Front */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group transition-colors duration-300 h-full">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Smile size={120} className="text-indigo-500" />
              </div>

              <div className="relative z-10">
                <h3 className="text-sm font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-6">Child Profile</h3>

                {child ? (
                  <>
                    <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center mb-6 text-2xl overflow-hidden">
                      {childPhoto ? <img src={childPhoto} alt={child.name} className="w-full h-full object-cover" /> : "👦"}
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 transition-colors">{child.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">
                      {child.age} Years Old
                    </p>
                    {child.gender && (
                      <p className={`font-medium transition-colors ${child.gender === 'Male'
                        ? 'text-blue-500 dark:text-blue-400'
                        : child.gender === 'Female'
                          ? 'text-pink-500 dark:text-pink-400'
                          : 'text-slate-500 dark:text-slate-400'
                        }`}>
                        {child.gender}
                      </p>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <button onClick={openEditChild} className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">
                        Edit Profile
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center mb-6 text-2xl">👦</div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 transition-colors">No child profile yet</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Add the child being monitored by the AI.</p>
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <button onClick={openEditChild} className="w-full py-3 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-2">
                        <Plus size={18} className="stroke-[2.5px]" /> Add Child Profile
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Desktop: Slide-down overlay */}
            <AnimatePresence>
              {addingChild && (
                <motion.div
                  key="child-edit-desktop"
                  variants={overlayVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="hidden md:block absolute inset-0 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl z-20 overflow-y-auto"
                >
                  {childEditContent}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Mobile: Expand down below the card */}
          <AnimatePresence>
            {addingChild && (
              <motion.div
                key="child-edit-mobile"
                variants={expandVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="md:hidden overflow-clip mt-3"
              >
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg">
                  {childEditContent}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ═══════════ USER PROFILE CARD ═══════════ */}
        <div className="relative">
          {/* Desktop: overlay container */}
          <motion.div
            animate={{ height: isDesktop && isEditing ? 730 : 455 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative md:rounded-[2rem] md:overflow-hidden"
          >
            {/* Front */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group transition-colors duration-300 h-full">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Heart size={120} className="text-pink-500" />
              </div>

              <div className="relative z-10">
                <h3 className="text-sm font-bold text-pink-500 dark:text-pink-400 uppercase tracking-widest mb-6">User Profile</h3>

                <div className="w-24 h-24 rounded-full bg-pink-50 dark:bg-pink-500/10 border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center mb-6 text-2xl font-black text-pink-500">
                  {initials}
                </div>

                <p className="text-sm font-bold text-pink-500 uppercase tracking-widest mb-1">{role}</p>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 transition-colors">{localName}</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors inline-flex items-center gap-2">
                  <UserRound size={16} /> ID: {userId}
                </p>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => { setAddingChild(false); setIsEditing(true); }} className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop: Slide-down overlay */}
            <AnimatePresence>
              {isEditing && (
                <motion.div
                  key="user-edit-desktop"
                  variants={overlayVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="hidden md:block absolute inset-0 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl z-20 overflow-y-auto"
                >
                  {userEditContent}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Mobile: Expand down below the card */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                key="user-edit-mobile"
                variants={expandVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="md:hidden overflow-clip mt-3"
              >
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg">
                  {userEditContent}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div >
      </motion.div >
    </>
  );
};

export default ProfileTab;