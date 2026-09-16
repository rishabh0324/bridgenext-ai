import React, { useState, useEffect } from "react";
import { CandidateItem } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  UserCheck,
  ShieldCheck,
  Award,
} from "lucide-react";
import Link from "next/link";
import { ApplicantProfileModal } from "./ApplicantProfileModal";

interface CandidatesPipelineProps {
  candidates: CandidateItem[];
  onAdvance?: (candidateId: string, nextStatus: string) => void;
}

const STAGES = [
  { id: "all", label: "All Applicants" },
  { id: "applied", label: "Applied" },
  { id: "under_review", label: "Under Review" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "technical_interview", label: "Technical Interview" },
  { id: "offered", label: "Offered" },
];

export const CandidatesPipeline: React.FC<CandidatesPipelineProps> = ({
  candidates: initialCandidates,
  onAdvance,
}) => {
  const [candidates, setCandidates] = useState<CandidateItem[]>(initialCandidates);
  const [activeStage, setActiveStage] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [minMatchFilter, setMinMatchFilter] = useState<number>(0);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateItem | null>(null);

  useEffect(() => {
    setCandidates(initialCandidates);
  }, [initialCandidates]);

  const advanceStage = (id: string, currentStatus: string) => {
    const s = currentStatus.toLowerCase();
    const nextStatus =
      s === "applied"
        ? "under_review"
        : s === "under_review" || s === "review"
        ? "shortlisted"
        : s === "shortlisted"
        ? "technical_interview"
        : s === "technical_interview" || s === "interview"
        ? "offered"
        : currentStatus;

    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus.toUpperCase() } : c))
    );

    if (onAdvance) {
      onAdvance(id, nextStatus.toUpperCase());
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const normStatus = (c.status || "applied").toLowerCase().replace(/\s+/g, "_");
    const matchesStage =
      activeStage === "all" ||
      normStatus === activeStage.toLowerCase() ||
      (activeStage === "under_review" && normStatus === "review") ||
      (activeStage === "technical_interview" && normStatus === "interview");

    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.department || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchQuery.toLowerCase());

    const score = c.matchScore || c.vectorMatchScore || 85;
    const matchesScore = score >= minMatchFilter;

    return matchesStage && matchesSearch && matchesScore;
  });

  return (
    <Card className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <UserCheck className="text-accent-cyan" size={20} />
            AI-Ranked Applicant Pipeline & Vector ATS
          </h3>
          <p className="text-xs text-slate-400">
            Multi-factor cosine vector similarity ranking matching your job skill weights in sub-50ms.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-2.5">
          <div className="relative min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input pl-9 pr-3 py-1.5 rounded-xl text-xs"
            />
          </div>

          <select
            value={minMatchFilter}
            onChange={(e) => setMinMatchFilter(Number(e.target.value))}
            className="glass-input px-2.5 py-1.5 rounded-xl text-xs bg-slate-900 text-slate-300"
          >
            <option value={0}>All Match Scores</option>
            <option value={80}>≥ 80% Match</option>
            <option value={90}>≥ 90% Match</option>
          </select>
        </div>
      </div>

      {/* Pipeline Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-white/5 scrollbar-none">
        {STAGES.map((stage) => {
          const count =
            stage.id === "all"
              ? candidates.length
              : candidates.filter((c) => {
                  const s = (c.status || "").toLowerCase().replace(/\s+/g, "_");
                  return (
                    s === stage.id ||
                    (stage.id === "under_review" && s === "review") ||
                    (stage.id === "technical_interview" && s === "interview")
                  );
                }).length;

          return (
            <button
              key={stage.id}
              onClick={() => setActiveStage(stage.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeStage === stage.id
                  ? "bg-primary-500 text-white shadow-glow"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{stage.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Candidate List */}
      <div className="space-y-3">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No candidates in this pipeline stage matching criteria.
          </div>
        ) : (
          filteredCandidates.map((cand) => {
            const score = cand.matchScore || cand.vectorMatchScore || 85;
            const normStatus = (cand.status || "applied").toLowerCase();

            return (
              <div
                key={cand.id || cand.studentId}
                className="p-4 rounded-2xl glass-card border border-white/5 hover:border-primary-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <img
                    src={
                      cand.avatarUrl ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cand.name)}`
                    }
                    alt={cand.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-white/10 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white hover:text-primary-300 transition-colors">
                        {cand.name}
                      </h4>
                      <Badge
                        variant={
                          score >= 90 ? "success" : score >= 80 ? "cyan" : "warning"
                        }
                        size="sm"
                      >
                        {score}% Vector Match
                      </Badge>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                        {cand.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                      <span>{cand.department || cand.degree || "Computer Science"}</span>
                      <span>•</span>
                      <span className="text-slate-300 font-semibold">CGPA: {cand.cgpa || 8.5}</span>
                      <span>•</span>
                      <span className="text-slate-400">{cand.collegeName || "NIT"}</span>
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {(cand.skills || cand.verifiedSkills || []).map((s: any, i: number) => {
                        const skillName = typeof s === "string" ? s : s?.name || "Skill";
                        const isVerified = typeof s === "object" ? s?.verified : true;
                        return (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 flex items-center gap-1"
                          >
                            {skillName}
                            {isVerified && <ShieldCheck size={11} className="text-emerald-400" />}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCandidate(cand)}
                  >
                    View Dossier
                  </Button>
                  <Link href={`/p/${cand.name.toLowerCase().replace(/\s+/g, "-")}`}>
                    <Button variant="ghost" size="sm" icon={<ExternalLink size={13} />}>
                      Portfolio
                    </Button>
                  </Link>
                  {normStatus !== "offered" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => advanceStage(cand.id, cand.status)}
                      icon={<ArrowRight size={13} />}
                    >
                      Advance Stage
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Applicant Profile Dossier Modal */}
      <ApplicantProfileModal
        candidate={selectedCandidate}
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onAdvanceStage={advanceStage}
      />
    </Card>
  );
};
