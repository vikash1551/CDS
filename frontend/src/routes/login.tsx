import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone, Shield, Store } from "lucide-react";
import { CustomLogo } from "@/components/Logo";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — UniDrop" },
      { name: "description", content: "Sign in to your UniDrop account." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<"student" | "merchant">("student");
  const isMerchant = role === "merchant";
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
      // Show the OTP in the toast for easy hackathon demoing
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
    // Auto-verify when all 6 digits entered
    if (next.every((d) => d)) {
      const fullOtp = next.join("");
      setLoading(true);
      api.post("/verify-otp", { email, otp: fullOtp })
        .then(res => {
          localStorage.setItem("auth_token", res.data.token);
          setOtpVerified(true);
          toast.success("OTP Verified!");
          setTimeout(() => navigate({ to: "/" }), 1000);
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
        const endpoint = isMerchant ? "/merchant/login" : "/login";
        const res = await api.post(endpoint, { email, password });
        localStorage.setItem("auth_token", res.data.token);
        toast.success("Logged in successfully");
        if (isMerchant) {
          navigate({ to: "/merchant" });
        } else {
          navigate({ to: "/" });
        }
      } else {
        const endpoint = isMerchant ? "/merchant/signup" : "/register";
        const payload = isMerchant
          ? { name, email, phone, password, shop_name: shopName, business_type: "canteen" }
          : { name, email, phone, password, role: "student" };
        const res = await api.post(endpoint, payload);
        localStorage.setItem("auth_token", res.data.token);
        toast.success("Account created!");
        if (isMerchant) {
          navigate({ to: "/merchant" });
        } else {
          navigate({ to: "/verify-college" });
        }
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

  // Merchant color scheme
  const merchantStyle = isMerchant ? {
    "--primary": "oklch(0.55 0.22 25)",
    "--primary-foreground": "#fff",
    "--brand": "oklch(0.55 0.22 25)",
    "--brand-foreground": "#fff",
    "--ring": "oklch(0.55 0.22 25)",
    "--color-primary": "oklch(0.55 0.22 25)",
    "--color-primary-foreground": "#fff",
    "--color-brand": "oklch(0.55 0.22 25)",
    "--color-brand-foreground": "#fff",
    "--color-ring": "oklch(0.55 0.22 25)",
  } as React.CSSProperties : {};

  const heroGradient = isMerchant
    ? "linear-gradient(180deg, oklch(0.92 0.08 25) 0%, oklch(0.97 0.02 25) 100%)"
    : undefined;

  return (
    <div className="min-h-screen bg-background transition-colors duration-500" style={merchantStyle}>
      {/* Top gradient section */}
      <div
        className="relative overflow-hidden px-6 pb-12 pt-14 md:px-8 md:pt-20 transition-all duration-500"
        style={{ backgroundImage: heroGradient || "var(--gradient-hero)" }}
      >
        {/* Decorative circles */}
        <div className={`absolute -right-10 -top-10 h-48 w-48 rounded-full transition-colors duration-500 ${isMerchant ? "bg-red-500/10" : "bg-primary/8"}`} />
        <div className={`absolute -left-8 bottom-0 h-32 w-32 rounded-full transition-colors duration-500 ${isMerchant ? "bg-rose-500/8" : "bg-primary/6"}`} />

        <div className="relative mx-auto max-w-[420px]">
          {/* Logo + Merchant Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-pop transition-all duration-500 ${isMerchant ? "bg-gradient-to-r from-red-500 to-rose-600 text-white" : "bg-brand text-brand-foreground"}`}>
                <CustomLogo className="h-6 w-6" />
              </span>
              <span className="text-xl font-bold tracking-tight text-foreground">
                UniDrop{isMerchant && <span className="ml-1 text-[10px] font-semibold bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent">MERCHANT</span>}
              </span>
            </div>
            <button
              onClick={() => setRole(role === "student" ? "merchant" : "student")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${isMerchant
                  ? "bg-warning/15 text-warning-foreground ring-1 ring-warning/30"
                  : "bg-foreground/8 text-foreground/60 hover:bg-foreground/12"
                }`}
            >
              <Store className="h-3.5 w-3.5" />
              {isMerchant ? "Merchant" : "Merchant?"}
            </button>
          </div>

          <h1 className="mt-8 text-3xl font-bold leading-tight text-foreground md:text-4xl">
            {isLogin ? (
              <>Welcome back 👋</>
            ) : isMerchant ? (
              <>List your shop<br />on campus 🏪</>
            ) : (
              <>Join the campus<br />network 🚀</>
            )}
          </h1>
          <p className="mt-2 text-sm text-foreground/60">
            {isLogin
              ? isMerchant
                ? "Sign in to manage your shop and orders"
                : "Sign in to order, lend, and earn on campus"
              : isMerchant
                ? "Register your canteen or store in 2 minutes"
                : "Create your account and start in 2 minutes"}
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="relative -mt-6 mx-auto max-w-[420px] px-4">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-pop md:p-7">
          {/* Toggle */}
          <div className="flex rounded-2xl bg-secondary p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); resetSignup(); }}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all"
                style={{
                  background: mode === m ? "var(--color-primary)" : "transparent",
                  color: mode === m ? "var(--color-primary-foreground)" : "var(--color-muted-foreground)",
                }}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">

            {/* ─── LOGIN MODE ─── */}
            {isLogin && (
              <>
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2.5 rounded-xl border border-input bg-background px-3.5 py-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">Password</label>
                    <button type="button" className="text-xs font-semibold text-primary">
                      Forgot?
                    </button>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-input bg-background px-3.5 py-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Login button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-bold text-brand-foreground shadow-soft transition-all hover:shadow-pop active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? <LoadingDots /> : (<>Log in <ArrowRight className="h-4 w-4" /></>)}
                </button>
              </>
            )}

            {/* ─── SIGNUP MODE ─── */}
            {!isLogin && (
              <>
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    {isMerchant ? "Owner Name" : "Full Name"}
                  </label>
                  <div className="flex items-center gap-2.5 rounded-xl border border-input bg-background px-3.5 py-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={isMerchant ? "Ramesh Kumar" : "Aarav Sharma"}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                      required
                    />
                  </div>
                </div>

                {/* Shop Name (Merchant only) */}
                {isMerchant && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Shop / Canteen Name</label>
                    <div className="flex items-center gap-2.5 rounded-xl border border-input bg-background px-3.5 py-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Hostel Canteen · Brew Hub"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email + OTP */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    {isMerchant ? "Business Email" : "Email"}
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3.5 py-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder={isMerchant ? "shop@campus.in" : "you@example.com"}
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setOtpSent(false); setOtpVerified(false); }}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                      required
                      disabled={otpVerified}
                    />
                    {otpVerified ? (
                      <span className="shrink-0 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">✓ Verified</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={!email || otpLoading}
                        className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-[11px] font-bold text-brand-foreground transition-all hover:shadow-soft active:scale-95 disabled:opacity-40"
                      >
                        {otpLoading ? "Sending..." : otpSent ? "Resend" : "Get OTP"}
                      </button>
                    )}
                  </div>
                </div>

                {/* OTP input (shown after Get OTP) */}
                {otpSent && !otpVerified && (
                  <div className="space-y-3 rounded-2xl border border-border bg-accent/50 p-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <p className="text-xs font-medium text-foreground">
                        Enter the 6-digit code sent to <span className="font-bold">{email}</span>
                      </p>
                    </div>
                    <div className="flex justify-center gap-2">
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
                          className="h-12 w-10 rounded-lg border-2 border-input bg-background text-center text-lg font-bold outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/20"
                          autoFocus={i === 0}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    {isMerchant ? "Business Phone" : "Phone Number"}
                  </label>
                  <div className="flex items-center gap-2.5 rounded-xl border border-input bg-background px-3.5 py-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">+91</span>
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Password</label>
                  <div className="flex items-center gap-2.5 rounded-xl border border-input bg-background px-3.5 py-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-muted-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Confirm Password</label>
                  <div className="flex items-center gap-2.5 rounded-xl border border-input bg-background px-3.5 py-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-muted-foreground">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[11px] font-medium text-destructive">Passwords don't match</p>
                  )}
                </div>

                {/* Signup button */}
                <button
                  type="submit"
                  disabled={loading || !otpVerified || password !== confirmPassword}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-bold text-brand-foreground shadow-soft transition-all hover:shadow-pop active:scale-[0.98] disabled:opacity-40"
                >
                  {loading ? <LoadingDots /> : (<>{isMerchant ? "Register shop" : "Create account"} <ArrowRight className="h-4 w-4" /></>)}
                </button>

                <p className="text-center text-[11px] text-muted-foreground">
                  By signing up, you agree to our{" "}
                  <span className="font-semibold text-primary">Terms</span> and{" "}
                  <span className="font-semibold text-primary">Privacy Policy</span>
                </p>
              </>
            )}
          </form>

          {/* Divider */}
          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-semibold text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Google login only */}
          <div className="mt-4">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-semibold transition-colors hover:bg-secondary">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        {/* Bottom switch */}
        <p className="mt-6 pb-8 text-center text-sm text-muted-foreground">
          {isLogin ? "New to UniDrop?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(isLogin ? "signup" : "login"); resetSignup(); }}
            className="font-bold text-primary"
          >
            {isLogin ? "Create account" : "Log in"}
          </button>
        </p>
      </div>

      <style>{`
        @keyframes login-dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-brand-foreground"
          style={{
            animation: "login-dot 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </span>
  );
}
