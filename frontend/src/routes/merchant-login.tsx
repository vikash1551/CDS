import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, Shield, Store, ShieldCheck, LockKeyhole, ArrowLeft, Package
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
      { title: "Merchant Portal — UniDrop" },
      { name: "description", content: "UniDrop merchant access. Manage your campus store, orders, and deliveries." },
    ],
  }),
  component: MerchantLogin,
});

function MerchantLogin() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [showForm, setShowForm] = useState(search.showForm || false);
  const [mode, setMode] = useState<"login" | "signup">(search.mode || "login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [shopName, setShopName] = useState("");

  // OTP state (signup only)
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isLogin = mode === "login";

  const handleSendOtp = async () => {
    if (!email) return;
    setOtpLoading(true);
    try {
      const res = await api.post("/send-otp", { email });
      setOtpSent(true);
      if (res.data.demo_otp) {
        toast.success(`OTP sent! Your demo code is: ${res.data.demo_otp}`, { duration: 10000 });
      } else {
        toast.success("OTP sent to your email");
      }
    } catch (err) {
      toast.error("Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (next.every((d) => d)) {
      const fullOtp = next.join("");
      setLoading(true);
      api.post("/verify-otp", { email, otp: fullOtp })
        .then(res => {
          localStorage.setItem("auth_token", res.data.token);
          setOtpVerified(true);
          toast.success("OTP Verified!");
          setTimeout(() => navigate({ to: "/merchant" }), 1000);
        })
        .catch(() => toast.error("Invalid OTP"))
        .finally(() => setLoading(false));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && password !== confirmPassword) return;

    setLoading(true);
    try {
      if (isLogin) {
        const res = await api.post("/merchant/login", { email, password });
        localStorage.setItem("auth_token", res.data.token);
        toast.success("Logged in successfully");
        navigate({ to: "/merchant" });
      } else {
        const payload = { name, email, phone, password, shop_name: shopName, business_type: "canteen" };
        const res = await api.post("/merchant/signup", payload);
        localStorage.setItem("auth_token", res.data.token);
        toast.success("Account created!");
        navigate({ to: "/merchant" });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetSignup = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtp(["", "", "", "", "", ""]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-0 md:p-6 transition-colors duration-500 auth-theme">
      <div className="w-full max-w-[420px] md:max-w-[840px] lg:max-w-[960px] xl:max-w-[1080px] bg-card border border-border/80 md:rounded-[32px] overflow-hidden shadow-pop md:min-h-[600px] flex flex-col md:flex-row animate-in fade-in duration-300">
        
        {/* Welcome Screen / Illustration Panel (Left Side) */}
        {!showForm ? (
          <>
            {/* Campus Merchant Illustration */}
            <div className="relative h-[280px] sm:h-[320px] md:h-auto w-full md:w-1/2 shrink-0 overflow-hidden">
              <img 
                src={merchantWelcomeImg} 
                alt="Campus Merchant onboarding illustration" 
                className="w-full h-full object-cover"
              />
              {/* Fade out gradient at bottom of illustration (mobile only) */}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent md:hidden" />
              {/* Fade out gradient to the right of illustration (desktop only) */}
              <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-transparent via-card/10 to-card" />
              
              {/* Top left badge capsule with merchant label */}
              <div className="absolute top-6 left-6 flex items-center gap-1.5 rounded-xl bg-card/90 px-3.5 py-2 shadow-soft border border-border/40 backdrop-blur-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand text-brand-foreground">
                  <CustomLogo className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] font-black tracking-widest text-brand flex items-center">
                  UNIDROP
                  <span className="ml-1.5 text-[8px] font-bold bg-brand/10 text-brand px-1.5 py-0.5 rounded tracking-normal">
                    MERCHANT
                  </span>
                </span>
              </div>
            </div>

            {/* Right Side: Authentication Panel */}
            <div className="px-6 pb-6 pt-4 md:p-10 flex-1 flex flex-col justify-between animate-in fade-in duration-300 relative">
              {/* Role Switcher */}
              <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
                <div className="flex bg-secondary/80 p-0.5 rounded-full border border-border shadow-sm">
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/login", search: { mode, showForm: false } })}
                    className="px-3 py-1 rounded-full text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-all"
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-full text-[10px] font-bold bg-brand text-brand-foreground shadow-sm cursor-default"
                  >
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

                {/* Authentication Methods (Buttons) */}
                <div className="space-y-3 mt-6">
                  {/* Primary login button */}
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full bg-brand text-brand-foreground rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold hover:bg-secondary active:scale-[0.98] transition-all shadow-soft cursor-pointer text-xs"
                  >
                    <Store className="h-4.5 w-4.5" />
                    Continue with Merchant Account
                  </button>

                  {/* Secondary login option */}
                  <button
                    onClick={() => setShowForm(true)}
                    className="w-full bg-background border border-border hover:bg-secondary/10 hover:text-brand hover:border-brand text-foreground rounded-xl py-3.5 flex items-center justify-center gap-2 font-bold active:scale-[0.98] transition-all shadow-soft cursor-pointer text-xs"
                  >
                    <Mail className="h-4.5 w-4.5 text-muted-foreground group-hover:text-brand" />
                    Merchant Email Login
                  </button>
                </div>

                {/* Feature highlights */}
                <div className="grid grid-cols-2 gap-2.5 mt-4">
                  <div className="rounded-xl bg-secondary/8 border border-secondary/20 p-3.5 text-center flex flex-col items-center justify-center gap-1.5">
                    <span className="text-lg">🏪</span>
                    <span className="text-[10px] font-bold text-foreground leading-tight">
                      Verified Campus Merchants
                    </span>
                    <span className="text-[8px] text-muted-foreground leading-tight">
                      Only institution-approved merchants can access the merchant portal.
                    </span>
                  </div>
                  <div className="rounded-xl bg-secondary/8 border border-secondary/20 p-3.5 text-center flex flex-col items-center justify-center gap-1.5">
                    <span className="text-lg">📦</span>
                    <span className="text-[10px] font-bold text-foreground leading-tight">
                      Manage Orders & Deliveries
                    </span>
                    <span className="text-[8px] text-muted-foreground leading-tight">
                      Track incoming orders and assigned student couriers.
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms disclaimer */}
              <p className="text-center text-[9px] text-muted-foreground mt-8">
                By continuing, you agree to UniDrop's{" "}
                <span className="font-semibold text-brand">Terms of Service</span> and{" "}
                <span className="font-semibold text-brand">Privacy Policy</span>.
              </p>
            </div>
          </>
        ) : (
          /* Actual Login / SignUp Form View */
          <>
            {/* Left illustration on desktop, hidden on mobile */}
            <div className="relative hidden md:block md:w-1/2 shrink-0 overflow-hidden">
              <img 
                src={merchantWelcomeImg} 
                alt="Campus onboarding illustration" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-card/10 to-card" />
              <div className="absolute top-6 left-6 flex items-center gap-1.5 rounded-xl bg-card/90 px-3.5 py-2 shadow-soft border border-border/40 backdrop-blur-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand text-brand-foreground">
                  <CustomLogo className="h-3.5 w-3.5" />
                </span>
                <span className="text-[10px] font-black tracking-widest text-brand flex items-center">
                  UNIDROP
                  <span className="ml-1.5 text-[8px] font-bold bg-brand/10 text-brand px-1.5 py-0.5 rounded tracking-normal">
                    MERCHANT
                  </span>
                </span>
              </div>
            </div>

            {/* Form side */}
            <div className="flex-1 flex flex-col p-6 md:p-10 justify-between animate-in slide-in-from-right duration-300 relative">
              {/* Role Switcher */}
              <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
                <div className="flex bg-secondary/80 p-0.5 rounded-full border border-border shadow-sm">
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/login", search: { mode, showForm: true } })}
                    className="px-3 py-1 rounded-full text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-all"
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-full text-[10px] font-bold bg-brand text-brand-foreground shadow-sm cursor-default"
                  >
                    Merchant
                  </button>
                </div>
              </div>

              <div>
                {/* Back Button */}
                <button 
                  onClick={() => setShowForm(false)} 
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to Welcome
                </button>

                {/* Logo */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-brand-foreground">
                      <CustomLogo className="h-4.5 w-4.5" />
                    </span>
                    <span className="text-sm font-bold tracking-tight flex items-center">
                      UniDrop
                      <span className="ml-1.5 text-[8px] font-bold bg-brand/10 text-brand px-1.5 py-0.5 rounded tracking-normal">
                        MERCHANT
                      </span>
                    </span>
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h2 className="text-xl font-bold tracking-tight">
                  {isLogin ? "Welcome back, Merchant" : "Register your shop"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1 mb-5">
                  {isLogin ? "Sign in to manage your store" : "Register your canteen or shop to start receiving orders"}
                </p>

                {/* Mode Toggle Tabs */}
                <div className="flex bg-secondary p-1 rounded-xl mb-5">
                  {(["login", "signup"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => { setMode(m); resetSignup(); }}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        mode === m 
                          ? "bg-card text-foreground shadow-soft" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m === "login" ? "Log in" : "Sign up"}
                    </button>
                  ))}
                </div>

                {/* Form Input fields */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  
                  {/* Owner Full name (Signup only) */}
                  {!isLogin && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Owner Name
                      </label>
                      <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-white shadow-sm px-3.5 py-2.5 transition-all focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Ramesh Kumar"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Shop Name (Signup only) */}
                  {!isLogin && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Shop / Canteen Name</label>
                      <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-white shadow-sm px-3.5 py-2.5 transition-all focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                        <Store className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Campus Bistro / Brew Hub"
                          value={shopName}
                          onChange={(e) => setShopName(e.target.value)}
                          className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Email (with OTP badge for Signup) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Merchant Email Address
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-white shadow-sm px-3.5 py-2 transition-all focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="cafeteria@merchant.college.edu"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setOtpSent(false); setOtpVerified(false); }}
                        className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
                        required
                        disabled={!isLogin && otpVerified}
                      />
                      {!isLogin && (
                        otpVerified ? (
                          <span className="shrink-0 rounded-lg bg-success/15 px-2 py-1 text-[9px] font-extrabold text-success">Verified</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={!email || otpLoading}
                            className="shrink-0 rounded-lg bg-brand text-brand-foreground px-2.5 py-1 text-[10px] font-bold transition-all disabled:opacity-40 cursor-pointer"
                          >
                            {otpLoading ? "Sending" : otpSent ? "Resend" : "Get OTP"}
                          </button>
                        )
                      )}
                    </div>
                    {isLogin && (
                      <p className="text-[9px] text-muted-foreground">
                        Use an approved merchant address, e.g., <span className="italic">cafeteria@merchant.college.edu</span>, <span className="italic">stationery@merchant.college.edu</span>, or <span className="italic">labstore@merchant.college.edu</span>
                      </p>
                    )}
                  </div>

                  {/* OTP verify box */}
                  {!isLogin && otpSent && !otpVerified && (
                    <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-3.5 animate-in slide-in-from-top duration-300">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-brand" />
                        <p className="text-[10px] font-semibold text-foreground">
                          Enter code sent to <span className="font-bold">{email}</span>
                        </p>
                      </div>
                      <div className="flex justify-center gap-1.5">
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => { otpRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(i, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                            className="h-10 w-9 rounded-lg border border-border bg-background text-center text-sm font-bold outline-none focus:border-brand"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Phone (Signup only) */}
                  {!isLogin && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Owner Phone Number</label>
                      <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-white shadow-sm px-3.5 py-2.5 transition-all focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-semibold">+91</span>
                        <input
                          type="tel"
                          placeholder="98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                      {isLogin && (
                        <button type="button" className="text-[10px] font-bold text-brand hover:underline cursor-pointer">
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-white shadow-sm px-3.5 py-2.5 transition-all focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
                        required
                        minLength={6}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password (Signup only) */}
                  {!isLogin && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Confirm Password</label>
                      <div className="flex items-center gap-2.5 rounded-xl border border-border/80 bg-white shadow-sm px-3.5 py-2.5 transition-all focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
                          required
                          minLength={6}
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-muted-foreground">
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-[10px] font-semibold text-destructive">Passwords don't match</p>
                      )}
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading || (!isLogin && !otpVerified) || (!isLogin && password !== confirmPassword)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-xs font-bold text-brand-foreground shadow-soft transition-all active:scale-[0.98] disabled:opacity-40 mt-4 cursor-pointer hover:bg-secondary"
                  >
                    {loading ? (
                      <span className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </span>
                    ) : (
                      <>
                        {isLogin ? "Log in as Merchant" : "Register Shop"} 
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Or continue with</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {/* Google Button */}
                <button 
                  type="button"
                  onClick={() => toast.info("Google Authentication is simulated.")}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-xs font-semibold hover:bg-secondary/30 transition-colors cursor-pointer"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google Account
                </button>
              </div>

              {/* Bottom Form Toggles */}
              <p className="mt-6 text-center text-xs text-muted-foreground">
                {isLogin ? "New merchant partner?" : "Already registered your shop?"}{" "}
                <button
                  onClick={() => { setMode(isLogin ? "signup" : "login"); resetSignup(); }}
                  className="font-bold text-brand hover:underline cursor-pointer"
                >
                  {isLogin ? "Register your shop" : "Log in"}
                </button>
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
