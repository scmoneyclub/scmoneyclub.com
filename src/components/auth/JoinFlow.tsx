"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2, Eye, EyeOff, UserPlus } from "lucide-react";

type Step = "invite" | "register" | "success";

interface Toast {
  type: "success" | "error";
  title: string;
  message: string;
}

export default function JoinFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("invite");
  const [inviteCode, setInviteCode] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");

  async function handleValidateInvite(e: React.FormEvent) {
    e.preventDefault();
    setToast(null);
    const code = inviteCode.trim();
    if (!code) {
      setToast({ type: "error", title: "Missing invite code", message: "Please enter your invite code to continue." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/validate-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("register");
      } else {
        setToast({
          type: "error",
          title: "Invalid invite code",
          message: data.error || "That invite code wasn't recognized. Please double-check and try again.",
        });
      }
    } catch {
      setToast({ type: "error", title: "Connection error", message: "Could not reach the server. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setToast(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email_address: email.trim(),
          password,
          company: company.trim(),
          phone: phone.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("success");
      } else {
        setToast({
          type: "error",
          title: "Registration failed",
          message: data.error || "Something went wrong. Please try again.",
        });
      }
    } catch {
      setToast({ type: "error", title: "Connection error", message: "Could not reach the server. Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <Alert className="border-green-500/30 bg-green-500/10">
        <CheckCircle className="size-4 text-green-500" />
        <AlertTitle className="text-green-400">Application received!</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>Your account has been created and is pending review. Our team will verify your information and grant full access shortly.</p>
          <Button
            className="mt-2 bg-white text-black hover:bg-green-500 hover:text-white cursor-pointer"
            onClick={() => router.push("/login")}
          >
            Go to Login
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-5">
      {toast && (
        <Alert
          variant={toast.type === "error" ? "destructive" : "default"}
          className={toast.type === "success" ? "border-green-500/30 bg-green-500/10" : ""}
        >
          {toast.type === "error"
            ? <AlertCircle className="size-4" />
            : <CheckCircle className="size-4 text-green-500" />}
          <AlertTitle>{toast.title}</AlertTitle>
          <AlertDescription>{toast.message}</AlertDescription>
        </Alert>
      )}

      {step === "invite" && (
        <form onSubmit={handleValidateInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-code">Invite Code</Label>
            <Input
              id="invite-code"
              placeholder="Enter your invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              disabled={loading}
              autoComplete="off"
            />
            <p className="text-xs text-gray-400">
              SC Money Club is invite-only. If you received an invite from a current member, enter your code above to unlock the registration form.
            </p>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black hover:bg-green-500 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="size-4 mr-2 animate-spin" /> Verifying...</>
            ) : (
              "Verify Invite Code"
            )}
          </Button>
        </form>
      )}

      {step === "register" && (
        <form onSubmit={handleRegister} className="space-y-4">
          <p className="text-xs text-green-400">Invite code accepted. Complete the form below to apply for membership.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input
                id="first-name"
                required
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                required
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-7 text-gray-400 hover:text-gray-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <p className="text-xs text-gray-400">Minimum 8 characters.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">
              Company <span className="text-gray-500 font-normal">(optional)</span>
            </Label>
            <Input
              id="company"
              placeholder="Acme Capital"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone <span className="text-gray-500 font-normal">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black hover:bg-green-500 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="size-4 mr-2 animate-spin" /> Creating account...</>
            ) : (
              <><UserPlus className="size-4 mr-2" /> Create Account</>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
