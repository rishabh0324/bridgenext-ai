"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import {
  Layers,
  LogOut,
  User,
  LayoutDashboard,
  LogIn,
  UserPlus,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, getDashboardRouteForRole } = useAuth();
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "STUDENT":
        return "primary";
      case "INDUSTRY":
        return "cyan";
      case "FACULTY":
        return "warning";
      case "INSTITUTION":
        return "success";
      case "ADMIN":
        return "purple";
      default:
        return "neutral";
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-cyan p-0.5 shadow-glow flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Layers className="text-accent-cyan w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">
                BridgeNext<span className="text-accent-cyan"> AI</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-300 border border-primary-500/30">
                SIH'26
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Academia–Industry Skill Intelligence Platform</p>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl glass-card border border-white/10 text-xs text-slate-200 hover:border-primary-400/50 transition-all"
              >
                <img
                  src={
                    user.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`
                  }
                  alt={user.name}
                  className="w-7 h-7 rounded-lg object-cover border border-white/10"
                />
                <div className="text-left hidden sm:block">
                  <p className="font-bold text-white text-xs leading-none">{user.name}</p>
                  <span className="text-[10px] text-slate-400 capitalize">{user.role.toLowerCase()}</span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 shadow-2xl z-50 border border-white/15 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="font-bold text-white text-xs">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1.5">
                        <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                          {user.role}
                        </Badge>
                      </div>
                    </div>

                    <Link
                      href={getDashboardRouteForRole(user.role)}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <LayoutDashboard size={14} className="text-primary-400" />
                      <span>My Dashboard</span>
                    </Link>

                    {!user.isOnboarded && (
                      <Link
                        href="/onboarding"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-amber-300 hover:bg-amber-500/10 transition-colors"
                      >
                        <User size={14} />
                        <span>Complete Onboarding</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left"
                    >
                      <LogOut size={14} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" icon={<LogIn size={14} />}>
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" icon={<UserPlus size={14} />}>
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
