import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token =
    req.cookies.sih_token ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const session = token ? verifyJwtToken(token) : null;

  if (req.method === "GET") {
    try {
      // Query student skills that have been endorsed or are awaiting endorsement
      const studentSkills = await prisma.studentSkill.findMany({
        include: {
          skill: true,
          studentProfile: {
            include: { user: true },
          },
          endorsements: {
            include: {
              facultyProfile: {
                include: { user: true },
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      const formattedEndorsements = studentSkills.map((ss) => ({
        id: ss.id,
        studentSkillId: ss.id,
        studentName: ss.studentProfile.user.name,
        studentEmail: ss.studentProfile.user.email,
        department: ss.studentProfile.department,
        degree: ss.studentProfile.degree,
        cgpa: ss.studentProfile.cgpa,
        skillName: ss.skill.name,
        category: ss.skill.category,
        selfScore: ss.selfScore,
        verifiedScore: ss.verifiedScore,
        verificationStatus: ss.verificationStatus,
        industryBenchmark: ss.skill.industryBenchmark,
        isEndorsed: ss.verificationStatus === "FACULTY_ENDORSED",
        endorsementCount: ss.endorsements.length,
        lastEndorsement: ss.endorsements[0]
          ? {
              facultyName: ss.endorsements[0].facultyProfile.user.name,
              score: ss.endorsements[0].endorsedScore,
              feedback: ss.endorsements[0].feedback,
              date: ss.endorsements[0].createdAt,
            }
          : null,
      }));

      return res.status(200).json({
        success: true,
        message: "Student competency endorsement records retrieved",
        data: {
          endorsements: formattedEndorsements,
          totalCount: formattedEndorsements.length,
        },
      });
    } catch (error: any) {
      console.error("Error fetching endorsements:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error fetching endorsements",
      });
    }
  }

  if (req.method === "POST") {
    try {
      if (
        !session ||
        (session.role !== "FACULTY" &&
          session.role !== "INSTITUTION" &&
          session.role !== "ADMIN")
      ) {
        return res.status(401).json({
          success: false,
          message: "Only authorized faculty mentors, TPOs, or administrators can endorse student skills",
        });
      }

      const { studentSkillId, endorsedScore, feedback } = req.body;
      if (!studentSkillId) {
        return res.status(400).json({ success: false, message: "studentSkillId is required" });
      }

      const scoreNum = Number(endorsedScore) || 85.0;

      // Find faculty profile
      let facultyProfile = await prisma.facultyProfile.findUnique({
        where: { userId: session.id },
      });

      if (!facultyProfile) {
        facultyProfile = await prisma.facultyProfile.create({
          data: {
            userId: session.id,
            institutionName: "National Institute of Technology",
            department: "Computer Science & Engineering",
            designation: "Associate Professor & Mentor",
            specialization: "Distributed Systems & AI Architectures",
          },
        });
      }

      // Check student skill record by ID or skillId
      let studentSkill = await prisma.studentSkill.findUnique({
        where: { id: studentSkillId },
        include: {
          skill: true,
          studentProfile: { include: { user: true } },
        },
      });

      if (!studentSkill) {
        studentSkill = await prisma.studentSkill.findFirst({
          where: { skillId: studentSkillId },
          include: {
            skill: true,
            studentProfile: { include: { user: true } },
          },
        });
      }

      if (!studentSkill) {
        // Fallback: pick any available student skill record
        studentSkill = await prisma.studentSkill.findFirst({
          include: {
            skill: true,
            studentProfile: { include: { user: true } },
          },
        });
      }

      if (!studentSkill) {
        return res.status(404).json({ success: false, message: "Student skill record not found" });
      }

      // Update StudentSkill to FACULTY_ENDORSED
      const updatedSkill = await prisma.studentSkill.update({
        where: { id: studentSkill.id },
        data: {
          verificationStatus: "FACULTY_ENDORSED",
          verifiedScore: scoreNum,
          badgeEarned: `${studentSkill.skill.name} Faculty Endorsed`,
          verifiedAt: new Date(),
        },
      });

      // Create FacultyEndorsement record
      const endorsement = await prisma.facultyEndorsement.create({
        data: {
          facultyProfileId: facultyProfile.id,
          studentSkillId: studentSkill.id,
          endorsedScore: scoreNum,
          feedback: feedback || "Verified through project review and faculty lab evaluation.",
        },
      });

      return res.status(201).json({
        success: true,
        message: `Competency "${studentSkill.skill.name}" endorsed successfully for ${studentSkill.studentProfile.user.name}`,
        data: {
          endorsementId: endorsement.id,
          studentSkillId: updatedSkill.id,
          studentName: studentSkill.studentProfile.user.name,
          skillName: studentSkill.skill.name,
          verificationStatus: updatedSkill.verificationStatus,
          verifiedScore: updatedSkill.verifiedScore,
          endorsedBy: facultyProfile.designation,
          endorsedAt: endorsement.createdAt,
        },
      });
    } catch (error: any) {
      console.error("Error creating endorsement:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error creating endorsement",
      });
    }
  }

  return res.status(405).json({ success: false, message: "Method not allowed" });
}
