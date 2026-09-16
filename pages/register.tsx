import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Layers,
  Mail,
  Lock,
  User,
  Phone,
  GraduationCap,
  Briefcase,
  Award,
  Building2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { UserRole } from "@/types";
import { cn } from "@/lib/utils";

type SignupRole = "STUDENT" | "INDUSTRY" | "FACULTY";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [selectedRole, setSelectedRole] = useState<SignupRole>("STUDENT");

  // Common Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Student-specific fields
  const [collegeName, setCollegeName] = useState("National Institute of Technology");
  const [degree, setDegree] = useState("B.Tech");
  const [cgpa, setCgpa] = useState("8.5");

  // Industry-specific fields
  const [companyName, setCompanyName] = useState("");

  // Faculty/TPO-specific fields
  const [institutionName, setInstitutionName] = useState("National Institute of Technology");
  const [facultyRoleType, setFacultyRoleType] = useState<"FACULTY" | "INSTITUTION">("FACULTY");

  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // 1. Name validation
    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage("Please enter your full name (at least 2 characters).");
      return;
    }

    // 2. Email validation
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Please enter a valid official or academic email address.");
      return;
    }

    // 3. Phone validation: exactly 10 digits
    const cleanedPhone = phone.trim().replace(/[\s\-\+\(\)]/g, "");
    const tenDigitPhone =
      cleanedPhone.length > 10 && cleanedPhone.startsWith("91")
        ? cleanedPhone.slice(2)
        : cleanedPhone;

    if (!/^\d{10}$/.test(tenDigitPhone)) {
      setErrorMessage("Phone number must be exactly 10 digits (numbers only, e.g. 9876543210).");
      return;
    }

    // 4. Password validation
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter your password.");
      return;
    }

    // 5. Role-specific validation
    if (selectedRole === "STUDENT") {
      if (!collegeName.trim()) {
        setErrorMessage("Please enter your College/Institution name.");
        return;
      }
      const numCgpa = parseFloat(cgpa);
      if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
        setErrorMessage("CGPA must be a valid number between 0.0 and 10.0 (e.g. 8.5).");
        return;
      }
    } else if (selectedRole === "INDUSTRY") {
      if (!companyName.trim()) {
        setErrorMessage("Please enter your Official Company name.");
        return;
      }
    } else if (selectedRole === "FACULTY") {
      if (!institutionName.trim()) {
        setErrorMessage("Please enter your College/Institution name.");
        return;
      }
    }

    if (!agreeTerms) {
      setErrorMessage("Please accept the terms of service to continue.");
      return;
    }

    setIsLoading(true);

    const actualRole: UserRole =
      selectedRole === "STUDENT"
        ? "STUDENT"
        : selectedRole === "INDUSTRY"
        ? "INDUSTRY"
        : facultyRoleType;

    const result = await register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: tenDigitPhone,
      password,
      confirmPassword,
      role: actualRole,
      collegeName: collegeName.trim(),
      institutionName: institutionName.trim(),
      companyName: companyName.trim(),
      degree,
      cgpa: selectedRole === "STUDENT" ? parseFloat(cgpa) : undefined,
    });

    if (result.success) {
      setSuccessMessage("Account created successfully! Redirecting to your dashboard...");
      setTimeout(() => {
        const dest =
          actualRole === "STUDENT"
            ? "/student"
            : actualRole === "INDUSTRY"
            ? "/industry"
            : actualRole === "INSTITUTION"
            ? "/institution"
            : "/faculty";
        router.push(dest);
      }, 500);
    } else {
      setErrorMessage(result.message);
      setIsLoading(false);
    }
  };

  const rolesList: {
    role: SignupRole;
    label: string;
    icon: any;
    desc: string;
    badge: string;
  }[] = [
    {
      role: "STUDENT",
      label: "1. Student",
      icon: GraduationCap,
      desc: "Skill verification, AI roadmaps & placements",
      badge: "Learner",
    },
    {
      role: "INDUSTRY",
      label: "2. Industry",
      icon: Briefcase,
      desc: "Talent recruitment & vector job drives",
      badge: "Recruiter",
    },
    {
      role: "FACULTY",
      label: "3. TPO / Faculty",
      icon: Award,
      desc: "Guidance slots, endorsements & placement analytics",
      badge: "Mentor / TPO",
    },
  ];

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-cyan p-0.5 mx-auto shadow-glow flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Layers className="text-accent-cyan w-6 h-6" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Create BridgeNext AI Account</h2>
          <p className="text-xs text-slate-400">SIH 2026 Academia–Industry Skill Intelligence Platform</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Step 1: Choose Your Platform Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            {rolesList.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.role;
              return (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => setSelectedRole(r.role)}
                  className={cn(
                    "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 relative group",
                    isSelected
                      ? "bg-primary-500/15 border-primary-500 shadow-glow"
                      : "bg-slate-900/60 border-white/5 hover:border-white/20 hover:bg-slate-900"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-xl flex items-center justify-center",
                        isSelected
                          ? "bg-primary-500 text-white"
                          : "bg-white/5 text-slate-400 group-hover:text-slate-200"
                      )}
                    >
                      <Icon size={14} />
                    </div>
                  </div>

                  <div>
                    <h4
                      className={cn(
                        "text-xs font-bold leading-tight",
                        isSelected ? "text-white" : "text-slate-300"
                      )}
                    >
                      {r.label}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{r.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
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

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              {selectedRole === "INDUSTRY" ? "Recruiter Full Name" : "Full Name"}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={selectedRole === "INDUSTRY" ? "e.g. Priya Nair (Lead Recruiter)" : "e.g. Aarav Sharma"}
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all pl-10"
              />
              <User size={16} className="absolute left-3.5 top-3 text-slate-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                {selectedRole === "INDUSTRY"
                  ? "Official Company Email"
                  : selectedRole === "FACULTY"
                  ? "Official Institutional Email"
                  : "College / Personal Email"}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === "INDUSTRY"
                      ? "name@company.com"
                      : "name@institution.edu"
                  }
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all pl-10"
                />
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Phone Number (10 Digits)</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="9876543210"
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all pl-10"
                />
                <Phone size={16} className="absolute left-3.5 top-3 text-slate-500" />
              </div>
            </div>
          </div>

          {/* Role-specific fields */}
          {selectedRole === "STUDENT" && (
            <>
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">College / Institution</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. National Institute of Technology"
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all pl-10"
                  />
                  <Building2 size={16} className="absolute left-3.5 top-3 text-slate-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">Degree Program</label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary-500"
                  >
                    <option value="B.Tech">B.Tech (4 Years Duration)</option>
                    <option value="M.Tech">M.Tech (2 Years Duration)</option>
                    <option value="PhD">PhD (Configurable Duration)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">Cumulative CGPA (0 - 10)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    required
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    placeholder="8.50"
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </>
          )}

          {selectedRole === "INDUSTRY" && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Company Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google India / Microsoft / TechCorp Global"
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all pl-10"
                />
                <Briefcase size={16} className="absolute left-3.5 top-3 text-slate-500" />
              </div>
            </div>
          )}

          {selectedRole === "FACULTY" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">College / Institution</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="e.g. National Institute of Technology"
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all pl-10"
                  />
                  <Building2 size={16} className="absolute left-3.5 top-3 text-slate-500" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">Institutional Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFacultyRoleType("FACULTY")}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center",
                      facultyRoleType === "FACULTY"
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-slate-900 border-white/10 text-slate-400"
                    )}
                  >
                    Faculty / Mentor
                  </button>
                  <button
                    type="button"
                    onClick={() => setFacultyRoleType("INSTITUTION")}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center",
                      facultyRoleType === "INSTITUTION"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                        : "bg-slate-900 border-white/10 text-slate-400"
                    )}
                  >
                    TPO / Placement Head
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all pl-10"
                />
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all pl-10"
                />
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded bg-slate-900 border-white/20 text-primary-500 focus:ring-0"
            />
            <label htmlFor="terms" className="cursor-pointer select-none">
              I agree to the BridgeNext AI platform terms and OBE verification standards.
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
            icon={<ArrowRight size={16} />}
          >
            Create {rolesList.find((r) => r.role === selectedRole)?.label} Account →
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400 border-t border-white/5">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary-400 hover:text-primary-300">
            Sign In Here →
          </Link>
        </div>
      </Card>
    </div>
  );
}
