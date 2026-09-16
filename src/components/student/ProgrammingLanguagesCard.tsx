"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Code2,
  Plus,
  Trash2,
  ShieldCheck,
  Award,
  Sparkles,
  Terminal,
  FolderGit2,
} from "lucide-react";
import { ProgrammingLanguageItem } from "@/types";

interface ProgrammingLanguagesCardProps {
  languages: ProgrammingLanguageItem[];
  onRefresh?: () => void;
}

const POPULAR_LANGUAGES = [
  "C++",
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "Go",
  "Rust",
  "Kotlin",
  "Swift",
  "C#",
  "C",
  "PHP",
  "Ruby",
  "Dart",
  "SQL",
];

export const ProgrammingLanguagesCard: React.FC<ProgrammingLanguagesCardProps> = ({
  languages = [],
  onRefresh,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("C++");
  const [proficiency, setProficiency] = useState<string>("Advanced");
  const [relatedProjects, setRelatedProjects] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAddLanguage = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      setIsSubmitting(true);
      const res = await fetch("/api/v1/student/programming-languages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLanguage,
          proficiency,
          relatedProjects: relatedProjects.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setRelatedProjects("");
        if (onRefresh) onRefresh();
      } else {
        setErrorMsg(json.message || "Failed to add language");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error saving language");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (langName: string) => {
    try {
      const res = await fetch(
        `/api/v1/student/programming-languages?language=${encodeURIComponent(langName)}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (json.success && onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error("Error deleting language:", err);
    }
  };

  const getProficiencyPercentage = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return 40;
      case "intermediate":
        return 70;
      case "advanced":
        return 90;
      case "expert":
        return 100;
      default:
        return 65;
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal size={18} className="text-accent-cyan" />
            Programming Languages
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified software languages used in BridgeNext AI candidate matching and vector benchmarking.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          icon={<Plus size={14} />}
        >
          Add Language
        </Button>
      </div>

      {languages.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-400 space-y-2">
          <Code2 size={24} className="mx-auto text-slate-500" />
          <p>No programming languages added yet.</p>
          <p className="text-[11px] text-slate-500">
            Click "Add Language" to showcase C++, Python, JavaScript, Java, Go, Rust, etc.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {languages.map((item, idx) => {
            const pct = getProficiencyPercentage(item.proficiency);
            const isVerified =
              item.verificationStatus === "ASSESSMENT_VERIFIED" ||
              item.verificationStatus === "FACULTY_ENDORSED";

            return (
              <div
                key={item.id || idx}
                className="p-4 rounded-2xl glass-card border border-white/5 hover:border-primary-500/30 flex flex-col justify-between space-y-3 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-primary-500/15 text-accent-cyan flex items-center justify-center font-mono font-bold text-xs border border-primary-500/20">
                      {item.language.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-primary-300 transition-colors">
                        {item.language}
                      </h4>
                      <span className="text-[11px] text-slate-400">{item.proficiency}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isVerified ? (
                      <Badge variant="success" size="sm">
                        <ShieldCheck size={11} className="mr-1" /> Verified
                      </Badge>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                        Self-Reported
                      </span>
                    )}

                    <button
                      onClick={() => handleDelete(item.language)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                      title="Remove language"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Proficiency Visual Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Proficiency Score</span>
                    <span className="font-mono text-slate-300 font-semibold">{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 90
                          ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
                          : pct >= 70
                          ? "bg-gradient-to-r from-primary-500 to-indigo-400"
                          : "bg-amber-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {item.relatedProjects && (
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 pt-1 border-t border-white/5 truncate">
                    <FolderGit2 size={11} className="text-primary-400 shrink-0" />
                    <span className="truncate">{item.relatedProjects}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Language Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Programming Language"
        maxWidth="md"
      >
        <form onSubmit={handleAddLanguage} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Programming Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs bg-slate-900 text-white"
            >
              {POPULAR_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Proficiency Level</label>
            <div className="grid grid-cols-4 gap-2">
              {["Beginner", "Intermediate", "Advanced", "Expert"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setProficiency(lvl)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    proficiency === lvl
                      ? "bg-primary-500 text-white border-primary-400 shadow-glow"
                      : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Related Project Evidence (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Distributed Key-Value Store, Neural Net Compiler"
              value={relatedProjects}
              onChange={(e) => setRelatedProjects(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Save Programming Language
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
