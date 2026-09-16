import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/auth";
import { calculateJobMatchScore } from "@/lib/vectorMatching";
import { MOCK_CANDIDATES } from "@/lib/mockData";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token =
    req.cookies.sih_token ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const session = token ? verifyJwtToken(token) : null;

  if (req.method === "GET") {
    try {
      const { status, jobId, minScore } = req.query;

      // Query database applications
      const applications = await prisma.jobApplication.findMany({
        where: {
          jobPostingId: jobId && typeof jobId === "string" ? jobId : undefined,
          status: status && typeof status === "string" ? status.toUpperCase() : undefined,
        },
        include: {
          jobPosting: true,
          studentProfile: {
            include: {
              user: true,
              skills: { include: { skill: true } },
            },
          },
        },
        orderBy: { vectorMatchScore: "desc" },
      });

      if (applications.length === 0) {
        let candidates = [...MOCK_CANDIDATES];
        if (status && typeof status === "string") {
          candidates = candidates.filter(
            (c) => c.status.toLowerCase() === status.toLowerCase()
          );
        }
        return res.status(200).json({
          success: true,
          message: "Candidates retrieved (mock pool)",
          data: {
            candidates,
            totalCount: candidates.length,
          },
        });
      }

      const formattedCandidates = applications.map((app) => {
        const student = app.studentProfile;
        const verifiedSkills = student.skills
          .filter((s) => s.verificationStatus === "ASSESSMENT_VERIFIED")
          .map((s) => ({
            name: s.skill.name,
            score: s.verifiedScore,
            verified: true,
          }));

        const allSkills = student.skills.map((s) => ({
          name: s.skill.name,
          score: s.verifiedScore || s.selfScore,
          verified: s.verificationStatus === "ASSESSMENT_VERIFIED",
        }));

        return {
          id: app.id,
          applicationId: app.id,
          studentId: student.id,
          name: student.user.name,
          email: student.user.email,
          avatarUrl:
            student.user.avatarUrl ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.user.name)}`,
          collegeName: student.collegeName,
          degree: student.degree,
          department: student.department,
          cgpa: student.cgpa || 8.5,
          jobId: app.jobPostingId,
          jobTitle: app.jobPosting.title,
          companyName: app.jobPosting.title,
          status: app.status,
          matchScore: app.matchScore,
          vectorMatchScore: app.vectorMatchScore,
          readinessScore: app.matchScore,
          appliedAt: app.appliedAt.toISOString().split("T")[0],
          verifiedSkills,
          skills: allSkills,
        };
      });

      return res.status(200).json({
        success: true,
        message: "Candidate applications retrieved successfully",
        data: {
          candidates: formattedCandidates,
          totalCount: formattedCandidates.length,
        },
      });
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error fetching applications",
      });
    }
  }

  if (req.method === "POST") {
    try {
      if (!session || session.role !== "STUDENT") {
        return res.status(401).json({
          success: false,
          message: "Only authenticated students can submit job applications",
        });
      }

      const { jobId } = req.body;
      if (!jobId || typeof jobId !== "string") {
        return res.status(400).json({ success: false, message: "Job ID is required" });
      }

      // Check if job exists
      const job = await prisma.jobPosting.findUnique({
        where: { id: jobId },
      });

      if (!job) {
        return res.status(404).json({ success: false, message: "Job posting not found" });
      }

      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: session.id },
        include: {
          skills: { include: { skill: true } },
          programmingLanguages: true,
        },
      });

      if (!studentProfile) {
        return res.status(404).json({ success: false, message: "Student profile not found" });
      }

      // Check Minimum CGPA Requirement
      const studentCgpa = studentProfile.cgpa ?? 0;
      const minRequiredCgpa = job.minCgpa ?? 0;

      if (studentCgpa < minRequiredCgpa) {
        return res.status(403).json({
          success: false,
          message: `You do not meet the minimum CGPA requirement of ${minRequiredCgpa} for this opportunity (your CGPA: ${studentCgpa.toFixed(2)}).`,
        });
      }

      // Check for duplicate application
      const existingApplication = await prisma.jobApplication.findUnique({
        where: {
          jobPostingId_studentProfileId: {
            jobPostingId: job.id,
            studentProfileId: studentProfile.id,
          },
        },
      });

      if (existingApplication) {
        return res.status(409).json({
          success: false,
          message: "You have already applied for this opening",
          data: {
            application: existingApplication,
          },
        });
      }

      // Calculate candidate vector match score for this job
      let requiredSkills = [];
      try {
        requiredSkills = JSON.parse(job.requiredSkillsJson);
      } catch (e) {
        requiredSkills = [];
      }

      const studentSkillRecords = [
        ...studentProfile.skills.map((ss) => ({
          id: ss.skill.id,
          name: ss.skill.name,
          category: ss.skill.category,
          selfScore: ss.selfScore,
          verifiedScore: ss.verifiedScore,
          verificationStatus: ss.verificationStatus,
          isVerified: ss.verificationStatus === "ASSESSMENT_VERIFIED",
        })),
        ...studentProfile.programmingLanguages.map((pl) => ({
          id: pl.id,
          name: pl.language,
          category: "Languages",
          selfScore: pl.proficiency === "Expert" ? 100 : pl.proficiency === "Advanced" ? 90 : pl.proficiency === "Intermediate" ? 70 : 40,
          verifiedScore: pl.verifiedScore || (pl.proficiency === "Expert" ? 100 : pl.proficiency === "Advanced" ? 90 : pl.proficiency === "Intermediate" ? 70 : 40),
          verificationStatus: pl.verificationStatus,
          isVerified: pl.verificationStatus !== "SELF_REPORTED",
        })),
      ];

      const matchResult = calculateJobMatchScore(
        studentSkillRecords,
        requiredSkills,
        studentProfile.cgpa,
        job.minCgpa
      );

      const application = await prisma.jobApplication.create({
        data: {
          jobPostingId: job.id,
          studentProfileId: studentProfile.id,
          status: "APPLIED",
          vectorMatchScore: matchResult.vectorMatchScore,
          matchScore: matchResult.matchScore,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Application submitted successfully with verified competency profile",
        data: {
          applicationId: application.id,
          jobId: application.jobPostingId,
          jobTitle: job.title,
          status: application.status,
          matchScore: application.matchScore,
          vectorMatchScore: application.vectorMatchScore,
          appliedAt: application.appliedAt,
        },
      });
    } catch (error: any) {
      console.error("Error submitting application:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error submitting application",
      });
    }
  }

  if (req.method === "PATCH") {
    try {
      if (!session || (session.role !== "INDUSTRY" && session.role !== "ADMIN")) {
        return res.status(401).json({
          success: false,
          message: "Only recruiters or administrators can advance candidate ATS status",
        });
      }

      const { applicationId, candidateId, status } = req.body;
      const targetStatus = (status || "SHORTLISTED").toUpperCase();

      let targetApp = null;
      if (applicationId && typeof applicationId === "string") {
        targetApp = await prisma.jobApplication.findUnique({
          where: { id: applicationId },
        });
      } else if (candidateId && typeof candidateId === "string") {
        targetApp = await prisma.jobApplication.findFirst({
          where: {
            OR: [
              { id: candidateId },
              { studentProfileId: candidateId },
            ],
          },
        });
      }

      if (!targetApp) {
        // Fallback response for mock items
        return res.status(200).json({
          success: true,
          message: `Candidate status advanced to ${targetStatus}`,
          data: {
            candidateId: candidateId || applicationId,
            updatedStatus: targetStatus,
          },
        });
      }

      const updated = await prisma.jobApplication.update({
        where: { id: targetApp.id },
        data: {
          status: targetStatus,
        },
        include: {
          jobPosting: true,
          studentProfile: {
            include: { user: true },
          },
        },
      });

      return res.status(200).json({
        success: true,
        message: `Candidate "${updated.studentProfile.user.name}" advanced to ${targetStatus}`,
        data: {
          applicationId: updated.id,
          candidateId: updated.studentProfileId,
          candidateName: updated.studentProfile.user.name,
          jobTitle: updated.jobPosting.title,
          updatedStatus: updated.status,
          updatedAt: updated.updatedAt,
        },
      });
    } catch (error: any) {
      console.error("Error updating application status:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error advancing candidate status",
      });
    }
  }

  return res.status(405).json({ success: false, message: "Method not allowed" });
}
