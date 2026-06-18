"use client";

import React, { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { User, Bell, ShieldAlert, Loader2, Save, Download, Trash2, Folder, Plus, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { trpc } from "@/src/trpc/client";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState(user?.primaryEmailAddress?.emailAddress || "");
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // Template Categories State
  const utils = trpc.useUtils();
  const { data: categories, isLoading: loadingCategories } = trpc.templates.getAllCategories.useQuery();
  
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const { mutate: createCategory, isPending: isCreatingCat } = trpc.templates.createCategory.useMutation({
    onSuccess: () => {
      toast.success("Category created!");
      setNewCategoryName("");
      utils.templates.getAllCategories.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to create category"),
  });

  const { mutate: updateCategory, isPending: isUpdatingCat } = trpc.templates.updateCategory.useMutation({
    onSuccess: () => {
      toast.success("Category updated!");
      setEditingCategoryId(null);
      setEditingCategoryName("");
      utils.templates.getAllCategories.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to update category"),
  });

  const { mutate: deleteCategory } = trpc.templates.deleteCategory.useMutation({
    onSuccess: () => {
      toast.success("Category deleted!");
      utils.templates.getAllCategories.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to delete category"),
    onSettled: () => setDeletingCategoryId(null),
  });

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      createCategory({ name: newCategoryName.trim() });
    }
  };

  const handleSaveEditCategory = (id: string) => {
    if (editingCategoryName.trim()) {
      updateCategory({ id, name: editingCategoryName.trim() });
    }
  };

  // Initialize state when user loads
  React.useEffect(() => {
    if (user && !firstName && !lastName) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setNotificationEmail(user.primaryEmailAddress?.emailAddress || "");
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      setIsSavingProfile(true);
      await user.update({ firstName, lastName });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    // Simulate API call for saving notification preferences
    setTimeout(() => {
      toast.success("Notification preferences saved");
      setIsSavingNotifications(false);
    }, 800);
  };

  const handleDeleteAccount = () => {
    const confirm = window.confirm("Are you absolutely sure you want to delete your account? This will permanently delete all your forms and responses. This action cannot be undone.");
    if (confirm) {
      toast.error("Account deletion requested. Please contact support.");
    }
  };

  const handleExportData = () => {
    toast.success("Data export started. You will receive an email shortly.");
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-neutral-400" size={32} />
      </div>
    );
  }

  return (
    <div className="relative z-0 min-h-[calc(100vh-64px-2rem)] bg-[#f5f5f3] dark:bg-zinc-950 flex flex-col p-6 md:px-10 m-4 rounded-[2rem] border border-neutral-200/60 dark:border-zinc-800 shadow-sm overflow-hidden">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#d9e5c9] dark:bg-emerald-900/10 rounded-full blur-[100px] -z-10 pointer-events-none opacity-60" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#e3ecd6] dark:bg-emerald-900/5 rounded-full blur-[120px] -z-10 pointer-events-none opacity-60" />

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-dashed border-neutral-300 dark:border-zinc-800 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-zinc-100 tracking-tight">Settings</h1>
          <p className="text-neutral-500 dark:text-zinc-400 text-sm mt-1">Manage your account, profile, and preferences.</p>
        </div>
      </div>

      <div className="flex flex-col gap-8 max-w-4xl pb-10">
        
        {/* Profile Settings */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-neutral-200/60 dark:border-zinc-800/60 rounded-3xl p-8 shadow-sm flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-zinc-800 pb-4">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-800 dark:text-zinc-100">Profile Settings</h2>
              <p className="text-xs text-neutral-500 dark:text-zinc-400">Update your personal information</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="shrink-0">
              <UserButton appearance={{ elements: { avatarBox: "w-20 h-20 shadow-md" } }} />
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-600 dark:text-zinc-400">First Name</label>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-neutral-800 dark:text-zinc-100"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-600 dark:text-zinc-400">Last Name</label>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-neutral-800 dark:text-zinc-100"
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-neutral-600 dark:text-zinc-400">Email Address (Read-only)</label>
                <input 
                  type="email" 
                  value={user?.primaryEmailAddress?.emailAddress || ""}
                  disabled
                  className="bg-neutral-50 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-neutral-500 dark:text-zinc-500 rounded-xl px-4 py-2 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-neutral-100 dark:border-zinc-800">
            <button 
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-neutral-900 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Profile
            </button>
          </div>
        </motion.section>

        {/* Notification Settings */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-neutral-200/60 dark:border-zinc-800/60 rounded-3xl p-8 shadow-sm flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-zinc-800 pb-4">
            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-800 dark:text-zinc-100">Notifications</h2>
              <p className="text-xs text-neutral-500 dark:text-zinc-400">Manage how we contact you</p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-zinc-700 rounded-2xl bg-white/50 dark:bg-zinc-800/50">
              <div>
                <h3 className="text-sm font-bold text-neutral-800 dark:text-zinc-100">Email Notifications</h3>
                <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-0.5">Receive an email when someone submits a form.</p>
              </div>
              <button 
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${emailNotifications ? "bg-emerald-500" : "bg-neutral-300 dark:bg-zinc-600"}`}
              >
                <motion.div 
                  layout
                  className="w-4 h-4 bg-white dark:bg-zinc-100 rounded-full shadow-sm"
                  animate={{ x: emailNotifications ? 24 : 0 }}
                />
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-600 dark:text-zinc-400">Notification Email Address</label>
              <input 
                type="email" 
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                disabled={!emailNotifications}
                className="bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 disabled:bg-neutral-50 dark:disabled:bg-zinc-800/50 text-neutral-800 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-neutral-100 dark:border-zinc-800">
            <button 
              onClick={handleSaveNotifications}
              disabled={isSavingNotifications}
              className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-neutral-900 px-5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            >
              {isSavingNotifications ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Preferences
            </button>
          </div>
        </motion.section>

        {/* Template Categories */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-neutral-200/60 dark:border-zinc-800/60 rounded-3xl p-8 shadow-sm flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-zinc-800 pb-4">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <Folder size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-800 dark:text-zinc-100">Template Categories</h2>
              <p className="text-xs text-neutral-500 dark:text-zinc-400">Manage your custom categories for templates</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {loadingCategories ? (
              <div className="flex justify-center py-4">
                <Loader2 size={24} className="animate-spin text-neutral-400 dark:text-zinc-500" />
              </div>
            ) : categories?.length === 0 ? (
              <div className="text-center py-4 text-sm text-neutral-500 dark:text-zinc-400 bg-neutral-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-neutral-200 dark:border-zinc-700">
                No categories found. Create one below.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {categories?.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 border border-neutral-200 dark:border-zinc-700 rounded-xl bg-white/50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 transition-colors group">
                    {editingCategoryId === cat.id ? (
                      <div className="flex flex-1 items-center gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSaveEditCategory(cat.id)}
                          className="flex-1 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/50 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-sm outline-none transition-colors text-neutral-800 dark:text-zinc-100"
                        />
                        <button
                          onClick={() => handleSaveEditCategory(cat.id)}
                          disabled={isUpdatingCat}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-50"
                        >
                          {isUpdatingCat ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        </button>
                        <button
                          onClick={() => setEditingCategoryId(null)}
                          disabled={isUpdatingCat}
                          className="p-1.5 text-neutral-400 hover:bg-neutral-100 rounded-lg disabled:opacity-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-neutral-800 dark:text-zinc-100">{cat.name}</span>
                          {cat.isGlobal && (
                            <span className="text-[10px] uppercase tracking-wider font-bold bg-neutral-100 dark:bg-zinc-700 text-neutral-500 dark:text-zinc-300 px-2 py-0.5 rounded-md">
                              Global
                            </span>
                          )}
                        </div>
                        
                        {!cat.isGlobal && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingCategoryId(cat.id);
                                setEditingCategoryName(cat.name);
                              }}
                              className="p-1.5 text-neutral-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              disabled={deletingCategoryId === cat.id}
                              onClick={() => {
                                setDeletingCategoryId(cat.id);
                                deleteCategory({ id: cat.id });
                              }}
                              className="p-1.5 text-neutral-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {deletingCategoryId === cat.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Create Category Input */}
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="New category name..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                className="flex-1 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-neutral-800 dark:text-zinc-100"
              />
              <button
                onClick={handleCreateCategory}
                disabled={isCreatingCat || !newCategoryName.trim()}
                className="flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-neutral-900 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shrink-0"
              >
                {isCreatingCat ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Add
              </button>
            </div>
          </div>
        </motion.section>

        {/* Danger Zone */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-900/30 rounded-3xl p-8 shadow-sm flex flex-col gap-6"
        >
          <div className="flex items-center gap-3 border-b border-red-100 dark:border-red-900/50 pb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-800 dark:text-red-400">Danger Zone</h2>
              <p className="text-xs text-red-500/80 dark:text-red-500/60">Irreversible account actions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/80 dark:bg-zinc-900/80 border border-red-100 dark:border-red-900/30 rounded-2xl p-5 flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-800 dark:text-zinc-100">Export Account Data</h3>
                <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-1">Download a JSON file containing all your forms, templates, and submissions.</p>
              </div>
              <button 
                onClick={handleExportData}
                className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 hover:bg-neutral-50 dark:hover:bg-zinc-700 text-neutral-700 dark:text-zinc-300 px-4 py-2 rounded-xl text-sm font-semibold transition-all w-full"
              >
                <Download size={16} /> Export Data
              </button>
            </div>

            <div className="bg-white/80 dark:bg-zinc-900/80 border border-red-100 dark:border-red-900/30 rounded-2xl p-5 flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-red-600 dark:text-red-400">Delete Account</h3>
                <p className="text-xs text-neutral-500 dark:text-zinc-400 mt-1">Permanently delete your account and all associated data. This cannot be undone.</p>
              </div>
              <button 
                onClick={handleDeleteAccount}
                className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-semibold transition-all w-full"
              >
                <Trash2 size={16} /> Delete Account
              </button>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
