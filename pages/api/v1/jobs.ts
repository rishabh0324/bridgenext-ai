import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/auth";
import { calculateJobMatchScore } from "@/lib/vectorMatching";
import { MOCK_JOBS } from "@/lib/mockData";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token =
    req.cookies.sih_token ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const session = token ? verifyJwtToken(token) : null;

  if (req.method === "GET") {
    try {
      const { type, status } = req.query;

      // Fetch all open job drives from database
      const dbJobs = await prisma.jobPosting.findMany({
        where: {
          status: status && typeof status === "string" ? status : undefined,
          jobType: type && typeof type === "string" ? type : undefined,
        },
        include: {
          industryProfile: {
            include: { user: true },
          },
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (dbJobs.length === 0) {
        // Return mock jobs if DB has not been seeded yet
        return res.status(200).json({
          success: true,
          message: "Job postings retrieved",
          data: {
            jobs: MOCK_JOBS,
            totalCount: MOCK_JOBS.length,
          },
        });
      }

      // If student is logged in, fetch their skills and calculate vector match score for each job
      let studentSkillRecords: any[] = [];
      let studentCgpa: number | null = null;
      let studentAppliedJobIds = new Map<string, string>(); // jobId -> applicationStatus

      if (session && session.role === "STUDENT") {
        const studentProfile = await prisma.studentProfile.findUnique({
          where: { userId: session.id },
          include: {
            skills: { include: { skill: true } },
            programmingLanguages: true,
            applications: true,
          },
        });

        if (studentProfile) {
          studentCgpa = studentProfile.cgpa;
          studentSkillRecords = [
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

          studentProfile.applications.forEach((app) => {
            studentAppliedJobIds.set(app.jobPostingId, app.status);
          });
        }
      }

      const formattedJobs = dbJobs.map((job) => {
        let requiredSkills = [];
        try {
          requiredSkills = JSON.parse(job.requiredSkillsJson);
        } catch (e) {
          requiredSkills = [];
        }

        let matchResult = {
          matchScore: 85,
          vectorMatchScore: 85,
          cosineSimilarity: 0.88,
          meetsMandatorySkills: true,
          meetsMinCgpa: true,
          matchedSkills: [] as any[],
        };

        if (session && session.role === "STUDENT" && studentSkillRecords.length > 0) {
          matchResult = calculateJobMatchScore(
            studentSkillRecords,
            requiredSkills,
            studentCgpa,
            job.minCgpa
          );
        }

        const isApplied = studentAppliedJobIds.has(job.id);
        const applicationStatus = studentAppliedJobIds.get(job.id) || null;

        return {
          id: job.id,
          companyName: job.industryProfile.companyName || "TechCorp Global",
          companyLogo: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=100&auto=format&fit=crop&q=80",
          title: job.title,
          description: job.description || "",
          type: job.jobType,
          location: job.location,
          stipendSalary: job.stipendSalary,
          stipendOrSalary: job.stipendSalary,
          minCgpa: job.minCgpa,
          deadline: job.deadline ? job.deadline.toISOString().split("T")[0] : "2026-10-30",
          status: job.status,
          applicantsCount: job._count.applications,
          requiredSkills,
          matchScore: matchResult.matchScore,
          vectorMatchScore: matchResult.vectorMatchScore,
          cosineSimilarity: matchResult.cosineSimilarity,
          meetsMandatorySkills: matchResult.meetsMandatorySkills,
          meetsMinCgpa: matchResult.meetsMinCgpa,
          matchedSkills: matchResult.matchedSkills,
          isApplied,
          applicationStatus,
        };
      });

      return res.status(200).json({
        success: true,
        message: "Job postings retrieved successfully",
        data: {
          jobs: formattedJobs,
          totalCount: formattedJobs.length,
        },
      });
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error fetching jobs",
      });
    }
  }

  if (req.method === "POST") {
    try {
      if (!session || (session.role !== "INDUSTRY" && session.role !== "ADMIN")) {
        return res.status(401).json({
          success: false,
          message: "Only authenticated industry recruiters can post job openings",
        });
      }

      const body = req.body;
      const {
        title,
        description,
        type,
        location,
        stipendSalary,
        minCgpa,
        deadline,
        requiredSkills,
      } = body;

      if (!title || typeof title !== "string") {
        return res.status(400).json({ success: false, message: "Job role title is required" });
      }

      // Find recruiter industry profile
      let industryProfile = await prisma.industryProfile.findUnique({
        where: { userId: session.id },
      });

      if (!industryProfile) {
        industryProfile = await prisma.industryProfile.create({
          data: {
            userId: session.id,
            companyName: "TechCorp Global",
            companyWebsite: "https://techcorp.example.com",
            designation: "Talent Acquisition Lead",
            domain: "Software & Cloud Systems",
            isVerified: true,
          },
        });
      }

      const parsedSkills = Array.isArray(requiredSkills)
        ? requiredSkills
        : [
            { name: "React.js & Next.js", weight: 5, minBenchmark: 80, isMandatory: true },
            { name: "Python & Fast-API", weight: 4, minBenchmark: 75, isMandatory: true },
          ];

      const newJob = await prisma.jobPosting.create({
        data: {
          industryProfileId: industryProfile.id,
          title: title.trim(),
          description: description || `Join our campus engineering team as a ${title.trim()}.`,
          jobType: type || "INTERNSHIP",
          location: location || "Bengaluru / Hybrid",
          stipendSalary: stipendSalary || "₹60,000/mo",
          minCgpa: Number(minCgpa) || 7.5,
          deadline: deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: "OPEN",
          requiredSkillsJson: JSON.stringify(parsedSkills),
        },
        include: {
          industryProfile: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: "Job opening published with skill vector weights",
        data: {
          job: {
            id: newJob.id,
            title: newJob.title,
            companyName: newJob.industryProfile.companyName,
            type: newJob.jobType,
            location: newJob.location,
            stipendSalary: newJob.stipendSalary,
            minCgpa: newJob.minCgpa,
            status: newJob.status,
            requiredSkills: parsedSkills,
            createdAt: newJob.createdAt,
          },
        },
      });
    } catch (error: any) {
      console.error("Error creating job opening:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error creating job opening",
      });
    }
  }

  return res.status(405).json({ success: false, message: "Method not allowed" });
}
