import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Layers, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, getDashboardRouteForRole } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // If already authenticated, redirect to appropriate route
  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.isOnboarded) {
        router.replace("/onboarding");
      } else {
        const redirectUrl = (router.query.redirect as string) || getDashboardRouteForRole(user.role);
        router.replace(redirectUrl);
      }
    }
  }, [isAuthenticated, user, router, getDashboardRouteForRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    const result = await login({ email, password });

    if (result.success && result.role) {
      setSuccessMessage("Login successful! Redirecting...");
      setTimeout(() => {
        if (result.isOnboarded === false) {
          router.push("/onboarding");
        } else {
          const redirectUrl = (router.query.redirect as string) || getDashboardRouteForRole(result.role!);
          router.push(redirectUrl);
        }
      }, 400);
    } else {
      setErrorMessage(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-cyan p-0.5 mx-auto shadow-glow flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Layers className="text-accent-cyan w-6 h-6" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Sign In to BridgeNext AI</h2>
          <p className="text-xs text-slate-400">SIH 2026 Academia–Industry Skill Intelligence Platform</p>
        </div>

        {/* Error / Success Alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 size={15} className="shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Real Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@institution.edu or name@company.com"
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all pl-10"
              />
              <Mail size={16} className="absolute left-3.5 top-3 text-slate-500" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-medium text-primary-400 hover:text-primary-300"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all pl-10"
              />
              <Lock size={16} className="absolute left-3.5 top-3 text-slate-500" />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
            icon={<ArrowRight size={16} />}
          >
            Sign In to Platform
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400 border-t border-white/5">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-primary-400 hover:text-primary-300">
            Create an Account →
          </Link>
        </div>
      </Card>
    </div>
  );
}
