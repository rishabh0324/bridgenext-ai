"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Calendar,
  Clock,
  Video,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface StudentGuidanceBookingProps {
  onRefresh?: () => void;
}

export const StudentGuidanceBooking: React.FC<StudentGuidanceBookingProps> = ({ onRefresh }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadSlots = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/mentorship");
      const json = await res.json();
      if (json.success && json.data?.sessions) {
        setSessions(json.data.sessions);
      }
    } catch (e) {
      console.error("Error loading guidance slots:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlots();
  }, []);

  const handleBookSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setErrorMsg("");
    setSuccessMsg("");
    try {
      setIsBooking(true);
      const res = await fetch("/api/v1/mentorship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "BOOK",
          slotId: selectedSlot.id || selectedSlot.slotId,
          notes: notes.trim() || "1:1 AI Skill Gap and Learning Roadmap consultation.",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg("Guidance slot confirmed successfully! Check meeting details below.");
        setSelectedSlot(null);
        setNotes("");
        await loadSlots();
        if (onRefresh) onRefresh();
      } else {
        setErrorMsg(json.message || "Failed to book slot");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error submitting booking");
    } finally {
      setIsBooking(false);
    }
  };

  const availableSlots = sessions.filter(
    (s) => s.status === "AVAILABLE" || s.slotStatus === "AVAILABLE"
  );
  const myBookings = sessions.filter(
    (s) => s.status === "CONFIRMED" || s.status === "BOOKED"
  );

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar size={18} className="text-amber-400" />
          Faculty Mentorship & Guidance Slots
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Book 1-on-1 sessions with institutional faculty and OBE mentors to review your skill recovery roadmaps and capstone projects.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Available Slots */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Available Mentor Availability Slots ({availableSlots.length})
          </h4>
        </div>

        {availableSlots.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-400">
            No open guidance slots available at this moment. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableSlots.map((slot) => (
              <div
                key={slot.id || slot.slotId}
                className="p-4 rounded-2xl glass-card border border-white/5 hover:border-amber-500/30 flex flex-col justify-between space-y-3 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="warning" size="sm">
                      {slot.durationMinutes || 30} Mins Guidance
                    </Badge>
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Clock size={11} /> Open
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-white leading-snug mt-1">
                    {slot.topic || slot.title}
                  </h5>

                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <UserCheck size={12} className="text-amber-400" />
                    <span>Mentor: {slot.facultyName || "Dr. Ramesh Verma"}</span>
                    {slot.facultyDesignation && <span>• {slot.facultyDesignation}</span>}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-300">
                    {formatDate(slot.scheduledAt)}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedSlot(slot)}
                  >
                    Book Slot
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmed Bookings */}
      {myBookings.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            My Confirmed Guidance Bookings ({myBookings.length})
          </h4>

          <div className="space-y-2.5">
            {myBookings.map((b) => (
              <div
                key={b.id || b.bookingId}
                className="p-4 rounded-2xl glass-card border border-emerald-500/20 bg-emerald-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm">
                      <CheckCircle2 size={11} className="mr-1" /> Confirmed
                    </Badge>
                    <h5 className="text-xs font-bold text-white">{b.topic || b.title}</h5>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Mentor: <strong className="text-slate-200">{b.facultyName}</strong> • {formatDate(b.scheduledAt)}
                  </p>
                </div>

                {b.meetingUrl || b.meetingLink ? (
                  <a
                    href={b.meetingUrl || b.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0"
                  >
                    <Button variant="secondary" size="sm" icon={<Video size={13} />}>
                      Join Google Meet
                    </Button>
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Confirmation Modal */}
      {selectedSlot && (
        <Modal
          isOpen={!!selectedSlot}
          onClose={() => setSelectedSlot(null)}
          title="Confirm Guidance Slot Booking"
          maxWidth="md"
        >
          <form onSubmit={handleBookSlot} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <h4 className="text-xs font-bold text-white">{selectedSlot.topic || selectedSlot.title}</h4>
              <p className="text-[11px] text-slate-400">
                Mentor: <strong className="text-amber-300">{selectedSlot.facultyName}</strong>
              </p>
              <p className="text-[11px] text-slate-400">
                Scheduled Time: <strong className="text-slate-200">{formatDate(selectedSlot.scheduledAt)}</strong>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Consultation Agenda / Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your current project or skill gaps you want to review..."
                className="w-full glass-input p-3 rounded-xl text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setSelectedSlot(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isBooking}>
                Confirm Booking
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </Card>
  );
};
