import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Store,
  Shield, ShieldCheck, ArrowLeft, CheckCircle2,
  XCircle, AlertCircle, RefreshCw, Building2
} from "lucide-react";
import { CustomLogo } from "@/components/Logo";
import merchantWelcomeImg from "../merchant_welcome.png";

export const Route = createFileRoute("/merchant-login")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      mode: (search.mode as "login" | "signup") || "login",
      showForm: search.showForm === "true" || search.showForm === true,
    };
  },
  head: () => ({
    meta: [
      { title: "Merchant Portal — Campus Flow" },
      { name: "description", content: "Campus Flow merchant access. Manage your campus store, orders, and deliveries." },
    ],
  }),
  component: MerchantLogin,
});

/* ─────────────── helpers ─────────────── */
const PERSONAL_DOMAINS = [
  "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
  "icloud.com", "protonmail.com", "aol.com", "live.com",
  "rediffmail.com", "ymail.com"
];

function isPersonalEmail(email: string): boolean {
  const domain = email.toLowerCase().split("@")[1] ?? "";
  return PERSONAL_DOMAINS.includes(domain);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  checks: { label: string; passed: boolean }[];
}

function getPasswordStrength(pw: string): PasswordStrength {
  const checks = [
    { label: "At least 8 characters", passed: pw.length >= 8 },
    { label: "One uppercase letter (A-Z)", passed: /[A-Z]/.test(pw) },
    { label: "One number (0-9)", passed: /[0-9]/.test(pw) },
    { label: "One special character", passed: /[^A-Za-z0-9]/.test(pw) },
  ];
  const score = checks.filter((c) => c.passed).length;
  const labels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["#DC2626", "#F97316", "#F59E0B", "#16A34A", "#047857"];
  return { score, label: labels[score] ?? "Very Weak", color: colors[score] ?? "#DC2626", checks };
}

/* ─────────────── types ─────────────── */
type SignupStep = "details" | "otp";

/* ─────────────── component ─────────────── */
function MerchantLogin() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [showForm, setShowForm] = useState(search.showForm || false);
  const [mode, setMode] = useState<"login" | "signup">(search.mode || "login");

  /* login */
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  /* signup – step 1 */
  const [signupStep, setSignupStep] = useState<SignupStep>("details");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  /* signup – step 2 */
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const pwStrength = getPasswordStrength(password);
  const emailValid = isValidEmail(email);
  const emailIsPersonal = emailValid && isPersonalEmail(email);
  const merchantEmailOk = emailValid && !emailIsPersonal;

  /* cooldown timer */
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  /* ── Login ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await api.post("/merchant/login", { email: loginEmail, password: loginPassword });
      localStorage.setItem("auth_token", res.data.token);
      toast.success("Welcome back, Merchant! 🏪");
      navigate({ to: "/merchant" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoginLoading(false);
    }
  };

  /* ── Step 1: Validate & send OTP ── */
  const handleDetailsContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) { toast.error("Please enter your store name"); return; }
    if (!merchantEmailOk) { toast.error("Please use an institution-approved merchant email address"); return; }
    if (pwStrength.score < 2) { toast.error("Please choose a stronger password"); return; }
    if (password !== confirmPassword) { toast.error("Passwords don't match"); return; }

    setDetailsLoading(true);
    try {
      const res = await api.post("/merchant/send-otp", { email, shop_name: shopName, password });
      setResendCooldown(60);
      setSignupStep("otp");
      if (res.data.demo_otp) {
        toast.success(`OTP sent! Demo code: ${res.data.demo_otp}`, { duration: 12000 });
      } else {
        toast.success("Verification code sent to your merchant email 📧");
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Failed to send OTP";
      toast.error(errMsg);
    } finally {
      setDetailsLoading(false);
    }
  };

  /* ── Step 2: OTP handlers ── */
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6);
      const next = ["", "", "", "", "", ""];
      for (let i = 0; i < digits.length; i++) next[i] = digits[i];
      setOtp(next);
      const focusIdx = Math.min(digits.length, 5);
      otpRefs.current[focusIdx]?.focus();
      if (digits.length === 6) verifyOtp(digits);
      return;
    }
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (next.every((d) => d)) verifyOtp(next.join(""));
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (code: string) => {
    if (otpLoading) return;
    setOtpLoading(true);
    try {
      const res = await api.post("/merchant/verify-otp", {
        email, otp: code, shop_name: shopName, password
      });
      localStorage.setItem("auth_token", res.data.token);
      toast.success(`Welcome to Campus Flow, ${res.data.shop_name || shopName}! 🏪`);
      setTimeout(() => navigate({ to: "/merchant" }), 800);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid verification code. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      const res = await api.post("/merchant/send-otp", { email, shop_name: shopName, password });
      setResendCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      if (res.data.demo_otp) {
        toast.success(`New OTP sent! Demo code: ${res.data.demo_otp}`, { duration: 12000 });
      } else {
        toast.success("New verification code sent!");
      }
    } catch {
      toast.error("Failed to resend OTP");
    }
  };

  const switchMode = (m: "login" | "signup") => {
    setMode(m);
    setSignupStep("details");
    setOtp(["", "", "", "", "", ""]);
  };

  /* ══════════════════════════════════════ RENDER ══════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-0 md:p-6 transition-colors duration-500 merchant-auth-theme">
      <div className="w-full max-w-[420px] md:max-w-[840px] lg:max-w-[960px] xl:max-w-[1080px] bg-card border border-border/80 md:rounded-[32px] overflow-hidden shadow-pop md:min-h-[600px] flex flex-col md:flex-row animate-in fade-in duration-300">

        {/* ══ WELCOME SCREEN ══ */}
        {!showForm ? (
          <>
            {/* Illustration */}
            <div className="relative h-[280px] sm:h-[320px] md:h-auto w-full md:w-1/2 shrink-0 overflow-hidden">
              <img src={merchantWelcomeImg} alt="Campus Merchant onboarding illustration" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent md:hidden" />
              <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-transparent via-card/10 to-card" />
              <div className="absolute top-6 left-6 flex items-center gap-1.5 rounded-xl bg-card/90 px-3.5 py-2 shadow-soft border border-border/40 backdrop-blur-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand text-brand-foreground">
                  <CustomLogo className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] font-black tracking-widest text-brand flex items-center">
                  CAMPUS FLOW
                  <span className="ml-1.5 text-[8px] font-bold bg-brand/10 text-brand px-1.5 py-0.5 rounded tracking-normal">MERCHANT</span>
                </span>
              </div>
            </div>

            {/* Right panel */}
            <div className="px-6 pb-6 pt-4 md:p-10 flex-1 flex flex-col justify-between animate-in fade-in duration-300 relative">
              {/* Role switcher */}
              <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
                <div className="flex bg-secondary/80 p-0.5 rounded-full border border-border shadow-sm">
                  <button type="button" onClick={() => navigate({ to: "/login", search: { mode, showForm: false } })}
                    className="px-3 py-1 rounded-full text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-all">
                    Student
                  </button>
                  <button type="button" className="px-3 py-1 rounded-full text-[10px] font-bold bg-brand text-brand-foreground shadow-sm cursor-default">
                    Merchant
                  </button>
                </div>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground leading-snug mt-6 md:mt-4">
                  Welcome back, Merchant
                </h1>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  Manage your campus store, orders, and deliveries from one place.
                </p>

                <div className="space-y-3 mt-6">
                  <button onClick={() => setShowForm(true)}
                    className="w-full bg-brand text-brand-foreground rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold hover:brightness-105 active:scale-[0.98] transition-all shadow-soft cursor-pointer text-xs">
                    <Store className="h-4.5 w-4.5" />
                    Continue with Merchant Account
                  </button>
                  <button onClick={() => setShowForm(true)}
                    className="w-full bg-background border border-border hover:bg-secondary/10 hover:text-brand hover:border-brand text-foreground rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold active:scale-[0.98] transition-all shadow-soft cursor-pointer text-xs">
                    <Mail className="h-4.5 w-4.5 text-muted-foreground" />
                    Merchant Email Login
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mt-4">
                  <div className="rounded-xl bg-secondary/8 border border-secondary/20 p-3.5 text-center flex flex-col items-center justify-center gap-1.5">
                    <span className="text-lg">🏪</span>
                    <span className="text-[10px] font-bold text-foreground leading-tight">Verified Campus Merchants</span>
                    <span className="text-[8px] text-muted-foreground leading-tight">Only institution-approved merchants can access the merchant portal.</span>
                  </div>
                  <div className="rounded-xl bg-secondary/8 border border-secondary/20 p-3.5 text-center flex flex-col items-center justify-center gap-1.5">
                    <span className="text-lg">📦</span>
                    <span className="text-[10px] font-bold text-foreground leading-tight">Manage Orders & Deliveries</span>
                    <span className="text-[8px] text-muted-foreground leading-tight">Track incoming orders and assigned student couriers.</span>
                  </div>
                </div>
              </div>

              <p className="text-center text-[9px] text-muted-foreground mt-8">
                By continuing, you agree to Campus Flow's{" "}
                <span className="font-semibold text-brand">Terms of Service</span> and{" "}
                <span className="font-semibold text-brand">Privacy Policy</span>.
              </p>
            </div>
          </>
        ) : (
          /* ══ FORM VIEW ══ */
          <>
            {/* Left illustration — desktop */}
            <div className="relative hidden md:block md:w-1/2 shrink-0 overflow-hidden">
              <img src={merchantWelcomeImg} alt="Campus Merchant" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-card/10 to-card" />
              <div className="absolute top-6 left-6 flex items-center gap-1.5 rounded-xl bg-card/90 px-3.5 py-2 shadow-soft border border-border/40 backdrop-blur-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand text-brand-foreground">
                  <CustomLogo className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] font-black tracking-widest text-brand flex items-center">
                  CAMPUS FLOW
                  <span className="ml-1.5 text-[8px] font-bold bg-brand/10 text-brand px-1.5 py-0.5 rounded tracking-normal">MERCHANT</span>
                </span>
              </div>
            </div>

            {/* Form panel */}
            <div className="flex-1 flex flex-col p-6 md:p-10 justify-start animate-in slide-in-from-right duration-300 relative overflow-y-auto">
              {/* Role switcher */}
              <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
                <div className="flex bg-secondary/80 p-0.5 rounded-full border border-border shadow-sm">
                  <button type="button" onClick={() => navigate({ to: "/login", search: { mode, showForm: true } })}
                    className="px-3 py-1 rounded-full text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-all">
                    Student
                  </button>
                  <button type="button" className="px-3 py-1 rounded-full text-[10px] font-bold bg-brand text-brand-foreground shadow-sm cursor-default">
                    Merchant
                  </button>
                </div>
              </div>

              {/* Back button */}
              <button
                onClick={() => {
                  if (mode === "signup" && signupStep === "otp") {
                    setSignupStep("details");
                    setOtp(["", "", "", "", "", ""]);
                  } else {
                    setShowForm(false);
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-5 cursor-pointer w-fit"
              >
                <ArrowLeft className="h-4 w-4" />
                {mode === "signup" && signupStep === "otp" ? "Back to Details" : "Back to Welcome"}
              </button>

              {/* Logo */}
              <div className="flex items-center gap-2 mb-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-brand-foreground">
                  <CustomLogo className="h-4.5 w-4.5" />
                </span>
                <span className="text-sm font-bold tracking-tight flex items-center">
                  Campus Flow
                  <span className="ml-1.5 text-[8px] font-bold bg-brand/10 text-brand px-1.5 py-0.5 rounded">MERCHANT</span>
                </span>
              </div>

              {/* Mode toggle */}
              <div className="flex bg-secondary p-1 rounded-xl mb-5">
                {(["login", "signup"] as const).map((m) => (
                  <button key={m} onClick={() => switchMode(m)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      mode === m ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
                    }`}>
                    {m === "login" ? "Log in" : "Sign up"}
                  </button>
                ))}
              </div>

              {/* ───── LOGIN ───── */}
              {mode === "login" && (
                <>
                  <h2 className="text-xl font-bold tracking-tight mb-1">Welcome back, Merchant</h2>
                  <p className="text-xs text-muted-foreground mb-5">Sign in to manage your store</p>
                  <form onSubmit={handleLogin} className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Merchant Email Address</label>
                      <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-white shadow-sm px-3.5 py-2.5 transition-all focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <input type="email" placeholder="cafeteria@merchant.college.edu" value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/60" required />
                      </div>
                      <p className="text-[9px] text-muted-foreground">Use your institution-approved merchant email address.</p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                        <button type="button" className="text-[10px] font-bold text-brand hover:underline cursor-pointer">Forgot Password?</button>
                      </div>
                      <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-white shadow-sm px-3.5 py-2.5 transition-all focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <input type={showLoginPw ? "text" : "password"} placeholder="••••••••" value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/60" required />
                        <button type="button" onClick={() => setShowLoginPw(!showLoginPw)} className="text-muted-foreground">
                          {showLoginPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button type="submit" disabled={loginLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-xs font-bold text-brand-foreground shadow-soft transition-all active:scale-[0.98] disabled:opacity-40 mt-4 cursor-pointer hover:brightness-105">
                      {loginLoading ? <LoadingDots /> : (<>Log in as Merchant <ArrowRight className="h-4 w-4" /></>)}
                    </button>
                  </form>
                </>
              )}

              {/* ───── SIGNUP STEP 1: Store Details ───── */}
              {mode === "signup" && signupStep === "details" && (
                <>
                  <StepIndicator current={1} />
                  <h2 className="text-xl font-bold tracking-tight mb-1">Register your store</h2>
                  <p className="text-xs text-muted-foreground mb-4">Set up your campus merchant account</p>

                  <form onSubmit={handleDetailsContinue} className="space-y-3.5">
                    {/* Store Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Merchant / Store Name</label>
                      <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-white shadow-sm px-3.5 py-2.5 transition-all focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <input type="text" placeholder="Campus Cafe · Stationery Store · Lab Equipment" value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/60" required />
                      </div>
                    </div>

                    {/* Merchant Email */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Merchant Email Address</label>
                      <div className={`flex items-center gap-2 rounded-xl border bg-white shadow-sm px-3.5 py-2.5 transition-all focus-within:ring-4 ${
                        emailTouched && email
                          ? merchantEmailOk
                            ? "border-green-400 focus-within:ring-green-400/10"
                            : "border-red-400 focus-within:ring-red-400/10"
                          : "border-border/80 focus-within:border-brand focus-within:ring-brand/10"
                      }`}>
                        <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                        <input type="email" placeholder="cafeteria@merchant.college.edu" value={email}
                          onChange={(e) => { setEmail(e.target.value); setEmailTouched(true); }}
                          onBlur={() => setEmailTouched(true)}
                          className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/60" required />
                        {emailTouched && email && (
                          merchantEmailOk
                            ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            : <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                        )}
                      </div>
                      {emailTouched && email && !merchantEmailOk && (
                        <div className="flex items-start gap-1.5 mt-1">
                          <AlertCircle className="h-3 w-3 text-red-500 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-red-500 font-medium">
                            {!isValidEmail(email)
                              ? "Enter a valid email address"
                              : emailIsPersonal
                                ? "Personal email providers (Gmail, Yahoo, Outlook) are not allowed. Please use an institution-approved merchant email."
                                : "Please use an institution-approved merchant email address."}
                          </p>
                        </div>
                      )}
                      {merchantEmailOk && (
                        <p className="text-[10px] text-green-600 font-medium mt-1 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Institution email accepted ✓
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Create Password</label>
                      <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-white shadow-sm px-3.5 py-2.5 transition-all focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <input type={showPw ? "text" : "password"} placeholder="Min. 8 characters" value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/60" required />
                        <button type="button" onClick={() => setShowPw(!showPw)} className="text-muted-foreground">
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {password && (
                        <div className="mt-2 space-y-2">
                          <div className="flex gap-1">
                            {[0, 1, 2, 3].map((i) => (
                              <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                                style={{ background: i < pwStrength.score ? pwStrength.color : "#E7E5E4" }} />
                            ))}
                          </div>
                          <p className="text-[10px] font-semibold" style={{ color: pwStrength.color }}>{pwStrength.label}</p>
                          <div className="grid grid-cols-2 gap-1">
                            {pwStrength.checks.map((c) => (
                              <div key={c.label} className={`flex items-center gap-1 text-[9px] font-medium ${c.passed ? "text-green-600" : "text-muted-foreground"}`}>
                                {c.passed
                                  ? <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />
                                  : <div className="h-2.5 w-2.5 rounded-full border border-current shrink-0" />}
                                {c.label}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Confirm Password</label>
                      <div className={`flex items-center gap-2.5 rounded-xl border bg-white shadow-sm px-3.5 py-2.5 transition-all focus-within:ring-4 ${
                        confirmPassword && password !== confirmPassword
                          ? "border-red-400 focus-within:ring-red-400/10"
                          : confirmPassword && password === confirmPassword
                            ? "border-green-400 focus-within:ring-green-400/10"
                            : "border-border/80 focus-within:border-brand focus-within:ring-brand/10"
                      }`}>
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <input type={showConfirmPw ? "text" : "password"} placeholder="Re-enter password" value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/60" required />
                        <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="text-muted-foreground">
                          {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-[10px] font-semibold text-red-500">Passwords don't match</p>
                      )}
                      {confirmPassword && password === confirmPassword && (
                        <p className="text-[10px] font-semibold text-green-600">Passwords match ✓</p>
                      )}
                    </div>

                    <button type="submit"
                      disabled={detailsLoading || !merchantEmailOk || pwStrength.score < 2 || password !== confirmPassword || !shopName.trim()}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-xs font-bold text-brand-foreground shadow-soft transition-all active:scale-[0.98] disabled:opacity-40 mt-2 cursor-pointer hover:brightness-105">
                      {detailsLoading ? <LoadingDots /> : (<>Continue <ArrowRight className="h-4 w-4" /></>)}
                    </button>
                  </form>
                </>
              )}

              {/* ───── SIGNUP STEP 2: OTP Verification ───── */}
              {mode === "signup" && signupStep === "otp" && (
                <div className="flex flex-col">
                  <StepIndicator current={2} />

                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10 mb-3">
                      <Shield className="h-8 w-8 text-brand" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Verify Merchant Email</h2>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xs">
                      We've sent a 6-digit verification code to your merchant email address.
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 bg-brand/8 border border-brand/20 rounded-xl px-3 py-2">
                      <Mail className="h-3.5 w-3.5 text-brand shrink-0" />
                      <span className="text-[11px] font-semibold text-brand">{email}</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-2 mb-2">
                    {otp.map((digit, i) => (
                      <input key={i} ref={(el) => { otpRefs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={6}
                        value={digit} onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        disabled={otpLoading}
                        className={`h-12 w-11 rounded-xl border text-center text-base font-bold outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:opacity-50 ${
                          digit ? "border-brand bg-brand/5 text-brand" : "border-border bg-background text-foreground"
                        }`}
                        autoFocus={i === 0} />
                    ))}
                  </div>

                  {otpLoading && (
                    <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
                      <div className="h-3.5 w-3.5 rounded-full border-2 border-brand border-t-transparent animate-spin" />
                      Verifying your code…
                    </div>
                  )}

                  <div className="flex flex-col items-center gap-3 mt-5">
                    <button onClick={handleResendOtp} disabled={resendCooldown > 0}
                      className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-brand disabled:opacity-40 cursor-pointer transition-all">
                      <RefreshCw className="h-3.5 w-3.5" />
                      {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                    </button>
                    <button onClick={() => { setSignupStep("details"); setOtp(["", "", "", "", "", ""]); }}
                      className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer transition-all underline underline-offset-2">
                      Change Email Address
                    </button>
                  </div>

                  <div className="mt-6 rounded-xl bg-secondary/50 border border-border p-3.5 flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      <span className="font-bold text-foreground">Only institution-approved merchants</span> can access the Campus Flow merchant portal. Your email confirms your institutional identity.
                    </p>
                  </div>
                </div>
              )}

            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ─── Step Indicator ─── */
function StepIndicator({ current }: { current: 1 | 2 }) {
  const steps = [
    { n: 1, label: "Store Details" },
    { n: 2, label: "Verify Email" },
  ];
  return (
    <div className="flex items-center gap-1.5 mb-4 w-full">
      {steps.map((s, idx) => {
        const done = s.n < current;
        const active = s.n === current;
        return (
          <div key={s.n} className="flex items-center gap-1.5 flex-1">
            <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
              done ? "bg-green-500 text-white" : active ? "bg-brand text-white" : "bg-muted text-muted-foreground border border-border"
            }`}>
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.n}
            </div>
            <span className={`text-[10px] font-semibold whitespace-nowrap ${active ? "text-foreground" : "text-muted-foreground"} ${done ? "opacity-50" : ""}`}>
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <div className={`h-px flex-1 transition-all ${done ? "bg-green-400" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  );
}
