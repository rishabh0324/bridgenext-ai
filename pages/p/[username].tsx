import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkillRadarChart } from "@/components/student/SkillRadarChart";
import {
  GraduationCap,
  Award,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Building,
  Github,
  Mail,
  Download,
  Share2,
  Sparkles,
  ArrowLeft,
  Terminal,
  Target,
} from "lucide-react";

export default function PublicStudentPortfolioPage() {
  const router = useRouter();
  const { username } = router.query;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (username) {
      setLoading(true);
      fetch(`/api/v1/portfolio/${username}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setData(json.data);
          }
        })
        .catch((err) => console.error("Error loading public portfolio:", err))
        .finally(() => setLoading(false));
    }
  }, [username]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400">Loading verified student credentials...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <Card className="p-8 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
            <GraduationCap size={24} />
          </div>
          <h2 className="text-lg font-bold text-white">Student Portfolio Not Found</h2>
          <p className="text-xs text-slate-400">
            The requested public verified profile could not be located in the BridgeNext AI database.
          </p>
          <Link href="/">
            <Button variant="secondary" size="sm" icon={<ArrowLeft size={14} />}>
              Back to Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const {
    user,
    profile,
    programmingLanguages = [],
    verifiedBadges = [],
    radarSkills = [],
    endorsements = [],
    projects = [],
    accreditationProof,
  } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Verification Trust Header */}
      <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/[0.15] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shadow-glow">
            <ShieldCheck size={20} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Outcome-Based Education (OBE) Verified Portfolio
              </span>
              <Badge variant="success" size="sm">NEP 2020 Aligned</Badge>
            </div>
            <p className="text-[11px] text-slate-300">
              Verified by {profile.collegeName} & BridgeNext AI National Competency Engine.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} icon={<Share2 size={13} />}>
            {copied ? "Link Copied!" : "Share Profile"}
          </Button>
          <Button variant="primary" size="sm" onClick={handlePrint} icon={<Download size={13} />}>
            Print / PDF Resume
          </Button>
        </div>
      </div>

      {/* Main Student Header Card */}
      <Card className="p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={
                user.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`
              }
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500 shadow-glow"
            />
            <div>
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              <p className="text-xs font-semibold text-primary-400 mt-0.5">
                {profile.degree} • {profile.department} (Class of {profile.graduationYear})
              </p>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <Building size={13} className="text-slate-400" />
                <span>{profile.collegeName}</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">CGPA: {profile.cgpa}/10</span>
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 text-right space-y-1 sm:min-w-[160px]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              OBE Credential ID
            </span>
            <p className="font-mono text-xs font-bold text-accent-cyan truncate">
              SIH26-{user.id.substring(0, 10).toUpperCase()}
            </p>
            <span className="text-[10px] text-emerald-400 font-semibold block">
              ● Cryptographically Verified
            </span>
          </div>
        </div>

        {/* Target Careers */}
        {profile.targetCareers && profile.targetCareers.length > 0 && (
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
              <Target size={14} className="text-amber-400" /> Target Career Aspirations:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {profile.targetCareers.map((c: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg bg-primary-500/15 border border-primary-500/30 text-primary-300 font-medium text-[11px]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.bio && (
          <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/5">
            {profile.bio}
          </p>
        )}
      </Card>

      {/* Programming Languages */}
      {programmingLanguages.length > 0 && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal size={18} className="text-accent-cyan" />
                Verified Programming Languages
              </h3>
              <p className="text-xs text-slate-400">
                Software development languages evaluated for production systems.
              </p>
            </div>
            <Badge variant="cyan" size="sm">{programmingLanguages.length} Languages</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {programmingLanguages.map((lang: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl glass-card border border-white/10 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{lang.language}</h4>
                  {lang.verificationStatus !== "SELF_REPORTED" ? (
                    <ShieldCheck size={13} className="text-emerald-400" />
                  ) : null}
                </div>
                <p className="text-[10px] text-slate-400">
                  Proficiency: <strong className="text-cyan-300">{lang.proficiency}</strong>
                </p>
                {lang.relatedProjects && (
                  <p className="text-[9px] text-slate-500 truncate">{lang.relatedProjects}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Verified OBE Badges Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award size={18} className="text-amber-400" />
              Verifiable Outcome-Based Education (OBE) Badges
            </h3>
            <p className="text-xs text-slate-400">
              Directly tied to verified problem-solving and adaptive assessment percentiles.
            </p>
          </div>
          <Badge variant="cyan" size="sm">{verifiedBadges.length} Verified Badges</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
          {verifiedBadges.map((badge: any) => (
            <div
              key={badge.id}
              className="p-4 rounded-2xl glass-card border border-emerald-500/20 bg-emerald-950/10 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{badge.badgeName}</h4>
                    <p className="text-[10px] text-slate-400">{badge.skillName} • Verified Score: <strong className="text-emerald-400">{badge.score}%</strong></p>
                  </div>
                </div>
                <Badge variant="success" size="sm">{badge.obeLevel}</Badge>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Verification Hash: {badge.verificationHash}</span>
                <span className="text-slate-500">Issuer: BridgeNext AI</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Competency Radar & Capstone Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <SkillRadarChart skills={radarSkills} />
        </div>

        <div className="lg:col-span-6">
          <Card className="p-6 space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles size={18} className="text-accent-cyan" />
                Verified Capstone Projects
              </h3>
              <p className="text-xs text-slate-400">
                Endorsed by faculty mentors and backed by open-source code repositories.
              </p>
            </div>

            <div className="space-y-3 my-2">
              {projects.map((proj: any) => (
                <div
                  key={proj.id}
                  className="p-3.5 rounded-2xl glass-card border border-white/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white">{proj.title}</h4>
                    {proj.isVerified && (
                      <Badge variant="cyan" size="sm">
                        <CheckCircle2 size={10} className="mr-1" /> Faculty Endorsed
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{proj.description}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <span className="text-indigo-400 font-medium">{proj.techStack}</span>
                    {proj.repoUrl && (
                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-300 hover:text-white flex items-center gap-1 font-semibold"
                      >
                        <Github size={12} /> Source Code
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400 text-center">
              Accredited for NAAC Criterion 5.2.1 (Student Progression & BridgeNext AI Placement Badging)
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
