
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";

interface LoginResponse {
  success: boolean;
  user?: {
    ID: number;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    image: string;
    registration_status: string;
    company: string;
  };
  token?: string;
  error?: string;
}

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_SCMC_API_BASE_URL || "";
      if (!apiBaseUrl) {
        throw new Error("API base URL not configured");
      }
      const response = await axios.post<LoginResponse>(
        `${apiBaseUrl}/scmc/v1/login`,
        {
          login: email.trim(),
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success && response.data.user && response.data.token) {
        // Store token and user data
        if (typeof window !== "undefined") {
          localStorage.setItem("scmc_token", response.data.token);
          localStorage.setItem("scmc_user", JSON.stringify(response.data.user));
        }
        // Redirect to account or dashboard
        router.push("/account");
      } else {
        setError(response.data.error || "Login failed");
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data as LoginResponse | undefined;
        setError(errorData?.error || err.response?.statusText || "Login failed. Please try again.");
      } else {
        setError(err?.message || "An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
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
          onClick={() => setShowPassword(prev => !prev)}
          className="absolute right-3 top-7 text-gray-400 hover:text-gray-200"
          aria-label={showPassword ? "Hide password" : "Show password"}
          disabled={loading}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-black hover:bg-green-500 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Logging in...
          </>
        ) : (
          <>
            <KeyRound className="w-4 h-4 mr-2" />
            Login
          </>
        )}
      </Button>
    </form>
  );
}