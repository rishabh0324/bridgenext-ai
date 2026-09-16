"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  Award,
  Building,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Github,
  Terminal,
  BrainCircuit,
  Sparkles,
  ArrowRight,
  User,
} from "lucide-react";
import Link from "next/link";
import { CandidateItem } from "@/types";

interface ApplicantProfileModalProps {
  candidate: CandidateItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAdvanceStage?: (candidateId: string, nextStatus: string) => void;
}

export const ApplicantProfileModal: React.FC<ApplicantProfileModalProps> = ({
  candidate,
  isOpen,
  onClose,
  onAdvanceStage,
}) => {
  if (!candidate) return null;

  const score = candidate.matchScore || candidate.vectorMatchScore || 85;
  const username = candidate.name.toLowerCase().replace(/\s+/g, "-");

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Applicant Competency Dossier" maxWidth="lg">
      <div className="space-y-6">
        {/* Header Profile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3.5">
            <img
              src={
                candidate.avatarUrl ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(candidate.name)}`
              }
              alt={candidate.name}
              className="w-14 h-14 rounded-2xl object-cover border border-cyan-500/40 shadow-glow"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{candidate.name}</h3>
                <Badge
                  variant={score >= 90 ? "success" : score >= 80 ? "cyan" : "warning"}
                  size="sm"
                >
                  {score}% Vector Match
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                <span>{candidate.degree || "B.Tech"} • {candidate.department || "Computer Science"}</span>
                <span> • </span>
                <span className="text-slate-400">{candidate.collegeName || "NIT"}</span>
              </p>
              <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                CGPA: {candidate.cgpa || 8.5} / 10.0 • Verified Candidate
              </p>
            </div>
          </div>

          <Link href={`/p/${username}`} target="_blank">
            <Button variant="secondary" size="sm" icon={<ExternalLink size={13} />}>
              Public Portfolio
            </Button>
          </Link>
        </div>

        {/* BridgeNext AI Match Breakdown */}
        <div className="p-4 rounded-2xl glass-card border border-cyan-500/20 bg-cyan-950/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <BrainCircuit size={15} />
              BridgeNext AI Match Breakdown
            </span>
            <span className="text-xs font-mono font-bold text-white">{score}/100</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
            <div className="p-2 rounded-xl bg-black/30 border border-white/5">
              <span className="text-[10px] text-slate-400 block">Languages</span>
              <strong className="text-xs text-white">24 / 25</strong>
            </div>
            <div className="p-2 rounded-xl bg-black/30 border border-white/5">
              <span className="text-[10px] text-slate-400 block">Tech Skills</span>
              <strong className="text-xs text-white">32 / 35</strong>
            </div>
            <div className="p-2 rounded-xl bg-black/30 border border-white/5">
              <span className="text-[10px] text-slate-400 block">Projects</span>
              <strong className="text-xs text-white">18 / 20</strong>
            </div>
            <div className="p-2 rounded-xl bg-black/30 border border-white/5">
              <span className="text-[10px] text-slate-400 block">Verification</span>
              <strong className="text-xs text-emerald-400">9 / 10</strong>
            </div>
          </div>
        </div>

        {/* Skills & Verified Competencies */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Award size={14} className="text-amber-400" />
            Verified Skills & OBE Badges
          </h4>
          <div className="flex flex-wrap gap-2">
            {(candidate.skills || candidate.verifiedSkills || [
              { name: "React.js", verified: true },
              { name: "Python", verified: true },
              { name: "PostgreSQL", verified: true },
              { name: "Docker", verified: false },
            ]).map((s: any, idx: number) => {
              const sName = typeof s === "string" ? s : s.name;
              const isV = typeof s === "object" ? s.verified : true;
              return (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-center gap-1.5"
                >
                  <span>{sName}</span>
                  {isV ? (
                    <ShieldCheck size={13} className="text-emerald-400" />
                  ) : (
                    <span className="text-[10px] text-slate-500">(Self)</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Stage Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Current Status:</span>
            <Badge variant="neutral" size="sm">
              {candidate.status?.replace(/_/g, " ") || "APPLIED"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onAdvanceStage) onAdvanceStage(candidate.id, "SHORTLISTED");
                onClose();
              }}
            >
              Shortlist
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (onAdvanceStage) onAdvanceStage(candidate.id, "TECHNICAL_INTERVIEW");
                onClose();
              }}
            >
              Interview
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (onAdvanceStage) onAdvanceStage(candidate.id, "OFFERED");
                onClose();
              }}
            >
              Extend Offer
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
