import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRunnerStore } from "@/lib/store";
import { MobileShell } from "@/components/MobileShell";
import { TopBar } from "@/components/TopBar";
import { Star, Wallet, Award, Bike, ChevronRight, Settings, ShieldCheck, Heart, X, Palette, User as UserIcon, Camera, Mail, Phone, Save, Sun, Moon, Monitor } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/store";

type ThemeMode = "light" | "dark" | "system";

const themes = [
  { mode: "light" as ThemeMode, icon: <Sun className="h-5 w-5" />, label: "Light", desc: "Bright & clean" },
  { mode: "dark" as ThemeMode, icon: <Moon className="h-5 w-5" />, label: "Dark", desc: "Easy on eyes" },
  { mode: "system" as ThemeMode, icon: <Monitor className="h-5 w-5" />, label: "System", desc: "Auto-detect" },
];

function getStoredTheme(): ThemeMode {
  return (localStorage.getItem("theme") as ThemeMode) || "system";
}

function applyTheme(mode: ThemeMode) {
  const root = window.document.documentElement;
  root.classList.remove("light", "dark");
  if (mode === "system") {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(mode);
  }
}

export const Route = createFileRoute("/profile")({
  component: Profile,
});

function Profile() {
  const { isOnline, setOnline, setIncomingOrder, isReceivingOrder, activeOrderId, activeLendRequestId } = useRunnerStore();
  const { user: authUser } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    api.get('/profile')
      .then((res) => setProfileData(res.data))
      .catch(() => {});
  }, []);

  const stats = profileData?.stats || {};
  const user = profileData?.user || {};
  const rank = profileData?.rank || 'Rookie';

  const menuItems = [
    { icon: "📦", label: "My orders", sub: `${stats.deliveries_completed || 12} completed`, link: "/orders" },
    { icon: "🤝", label: "My lendings", sub: `${stats.items_lent || 5} active`, link: "/lend" },
    { icon: "🏆", label: "Leaderboard", sub: `${rank}`, link: "/leaderboard" },
    { icon: "⭐", label: "Reviews & ratings", sub: "4.9 average", link: "/" },
    { icon: "🔔", label: "Notifications", sub: "3 unread", link: "/notifications" },
    { icon: "❓", label: "Help & safety", sub: "24/7 campus support", link: "/" },
  ];

  const handleGoLive = () => {
    // If they have an active delivery or lending order, block them from going online
    if (!isOnline && (isReceivingOrder || activeOrderId || activeLendRequestId)) {
      toast.error("You cannot go online while you have an active order!");
      return;
    }
    // Simply toggle online status. Real orders will come via socket.
    setOnline(!isOnline);
    if (!isOnline) {
      toast.success("You are now online! 🚴");
    } else {
      toast.info("You are now offline");
    }
  };

  return (
    <MobileShell>
      <TopBar title="Profile" back={false} right={<button onClick={() => setShowSettings(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"><Settings className="h-4 w-4" /></button>} />

      <div className="bg-gradient-primary px-4 pb-8 pt-4 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-3xl text-brand-foreground ring-4 ring-card/20">
            🧑‍🎓
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold">{user.name || 'Vihaan Reddy'}</p>
            <p className="text-[11px] opacity-80">{user.email || 'CSE · 3rd year · @vihaan.r'}</p>
            <div className="mt-1 flex items-center gap-2 text-[11px]">
              <span className="flex items-center gap-0.5 rounded-full bg-card/15 px-2 py-0.5 font-semibold">
                <Star className="h-3 w-3 fill-warning text-warning" /> 4.9
              </span>
              <span className="flex items-center gap-1 rounded-full bg-card/15 px-2 py-0.5 font-semibold">
                <ShieldCheck className="h-3 w-3" /> Verified
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Mini icon={<Wallet className="h-4 w-4" />} label="Wallet" value={`₹${stats.wallet_balance || 420}`} />
          <Mini icon={<Award className="h-4 w-4" />} label="Points" value={`${(stats.points || 1280).toLocaleString()}`} />
          <Mini icon={<Bike className="h-4 w-4" />} label="Drops" value={`${stats.deliveries_completed || 38}`} />
        </div>
      </div>

      <div className="-mt-4 rounded-t-3xl bg-background px-4 pb-6 pt-5">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-brand-foreground">🚴</div>
            <div className="flex-1">
              <p className="text-sm font-bold">Runner mode</p>
              <p className="text-[11px] text-muted-foreground">Earn while heading to your next class</p>
            </div>
            <button 
              onClick={handleGoLive} 
              className={`rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground transition-all ${!isOnline && isReceivingOrder ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isOnline ? "Go offline" : "Go online"}
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          {menuItems.map((r) =>
            r.link ? (
              <Link key={r.label} to={r.link} className="w-full flex items-center text-left gap-3 rounded-2xl border border-border bg-card px-3 py-3 hover:bg-secondary/50 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-lg">{r.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{r.label}</p>
                  <p className="text-[11px] text-muted-foreground">{r.sub}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ) : (
              <button key={r.label} onClick={() => toast(`${r.label} coming soon in V2!`)} className="w-full flex items-center text-left gap-3 rounded-2xl border border-border bg-card px-3 py-3 hover:bg-secondary/50 transition-colors">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-lg">{r.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{r.label}</p>
                  <p className="text-[11px] text-muted-foreground">{r.sub}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            )
          )}
        </div>

        <div className="mt-5 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
          Made with <Heart className="h-3 w-3 fill-destructive text-destructive" /> for campus
        </div>
      </div>
      {/* Settings Panel */}
      {showSettings && <SettingsPanel user={authUser || user} onClose={() => setShowSettings(false)} />}
    </MobileShell>
  );
}

function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card/15 p-3 backdrop-blur">
      <div className="flex items-center gap-1 text-[10px] font-semibold opacity-80">{icon}{label}</div>
      <p className="mt-1 text-base font-bold">{value}</p>
    </div>
  );
}

/* ─── Settings Panel ─── */
function SettingsPanel({ user, onClose }: { user: any, onClose: () => void }) {
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);
  const [activeTab, setActiveTab] = useState<"appearance" | "profile">("appearance");

  // Profile fields
  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [bio, setBio] = useState(user?.bio || "");

  // Apply theme on mount + system preference changes
  useEffect(() => {
    applyTheme(theme);
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => { if (theme === "system") applyTheme("system"); };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const changeTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully!");
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
        <div className="w-full max-w-[480px] sm:max-w-[640px] pointer-events-auto rounded-t-3xl border-t border-border bg-card shadow-pop animate-in slide-in-from-bottom duration-300">
          {/* Handle + Header */}
          <div className="flex flex-col items-center pt-3 pb-2">
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>
          <div className="flex items-center justify-between px-5 pb-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-muted-foreground" />
              <h2 className="text-base font-bold">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mx-5 flex rounded-xl bg-secondary p-1 mb-4">
            {(["appearance", "profile"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {tab === "appearance" ? <Palette className="h-3.5 w-3.5" /> : <UserIcon className="h-3.5 w-3.5" />}
                {tab === "appearance" ? "Appearance" : "Profile"}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="max-h-[55vh] overflow-y-auto px-5 pb-6">
            {activeTab === "appearance" && (
              <div className="space-y-4">
                {/* Theme Selector */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-2">
                    {themes.map((t) => (
                      <button
                        key={t.mode}
                        onClick={() => changeTheme(t.mode)}
                        className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all active:scale-[0.97] ${
                          theme === t.mode
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-card hover:border-primary/30"
                        }`}
                      >
                        {theme === t.mode && (
                          <div className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                            <svg className="h-2.5 w-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          theme === t.mode ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                        }`}>
                          {t.icon}
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold">{t.label}</p>
                          <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-2xl border border-border bg-secondary/50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Preview</p>
                  <div className="flex items-center gap-3 rounded-xl bg-card p-3 border border-border">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">{user?.name ? user.name.substring(0, 2).toUpperCase() : "ST"}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{user?.name || "Student"}</p>
                      <p className="text-[11px] text-muted-foreground">This is how your app looks</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-4">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand text-4xl text-brand-foreground ring-4 ring-border">
                      🧑‍🎓
                    </div>
                    <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Tap to change photo</p>
                </div>

                {/* Fields */}
                <ProfileField icon={<UserIcon className="h-4 w-4" />} label="Full Name" value={name} onChange={setName} />
                <ProfileField icon={<span className="text-sm">@</span>} label="Username" value={username} onChange={setUsername} />
                <ProfileField icon={<Mail className="h-4 w-4" />} label="Email" value={email} onChange={setEmail} type="email" />
                <ProfileField icon={<Phone className="h-4 w-4" />} label="Phone" value={phone} onChange={setPhone} type="tel" />

                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20 resize-none placeholder:text-muted-foreground/60"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveProfile}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:shadow-soft active:scale-[0.98]"
                >
                  <Save className="h-4 w-4" /> Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Reusable Profile Field ─── */
function ProfileField({
  icon, label, value, onChange, type = "text"
}: {
  icon: React.ReactNode; label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2.5 rounded-xl border border-input bg-background px-3.5 py-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
        <span className="text-muted-foreground">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>
    </div>
  );
}
