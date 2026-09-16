import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/auth";

export const STANDARD_PROGRAMMING_LANGUAGES = [
  "C",
  "C++",
  "Java",
  "Python",
  "JavaScript",
  "TypeScript",
  "Go",
  "Rust",
  "Kotlin",
  "Swift",
  "PHP",
  "Ruby",
  "Dart",
  "C#",
  "Scala",
  "R",
  "SQL",
  "Shell / Bash",
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token =
    req.cookies.sih_token ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const session = token ? verifyJwtToken(token) : null;

  if (req.method === "GET") {
    try {
      const studentId = (req.query.studentId as string) || (session?.id);

      if (!studentId) {
        return res.status(400).json({ success: false, message: "Student ID required" });
      }

      // Find student profile
      let studentProfile = await prisma.studentProfile.findFirst({
        where: {
          OR: [
            { id: studentId },
            { userId: studentId },
          ],
        },
        include: {
          programmingLanguages: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!studentProfile) {
        return res.status(200).json({
          success: true,
          data: [],
          availableLanguages: STANDARD_PROGRAMMING_LANGUAGES,
        });
      }

      return res.status(200).json({
        success: true,
        data: studentProfile.programmingLanguages,
        availableLanguages: STANDARD_PROGRAMMING_LANGUAGES,
      });
    } catch (error: any) {
      console.error("Error fetching programming languages:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error fetching programming languages",
      });
    }
  }

  if (req.method === "POST") {
    try {
      if (!session || session.role !== "STUDENT") {
        return res.status(401).json({
          success: false,
          message: "Only authenticated students can add programming languages",
        });
      }

      const { language, proficiency, relatedProjects } = req.body;

      if (!language || typeof language !== "string") {
        return res.status(400).json({ success: false, message: "Language name is required" });
      }

      const validProficiencies = ["Beginner", "Intermediate", "Advanced", "Expert"];
      const prof = validProficiencies.includes(proficiency) ? proficiency : "Intermediate";

      let studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: session.id },
      });

      if (!studentProfile) {
        studentProfile = await prisma.studentProfile.create({
          data: {
            userId: session.id,
            collegeName: "National Institute of Technology",
            degree: "B.Tech",
            department: "Computer Science",
          },
        });
      }

      // Upsert programming language
      const record = await prisma.studentProgrammingLanguage.upsert({
        where: {
          studentProfileId_language: {
            studentProfileId: studentProfile.id,
            language: language.trim(),
          },
        },
        update: {
          proficiency: prof,
          relatedProjects: relatedProjects?.trim() || null,
        },
        create: {
          studentProfileId: studentProfile.id,
          language: language.trim(),
          proficiency: prof,
          verificationStatus: "SELF_REPORTED",
          relatedProjects: relatedProjects?.trim() || null,
        },
      });

      return res.status(201).json({
        success: true,
        message: `Programming language ${language} added to your verified profile`,
        data: record,
      });
    } catch (error: any) {
      console.error("Error adding programming language:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error saving programming language",
      });
    }
  }

  if (req.method === "DELETE") {
    try {
      if (!session || session.role !== "STUDENT") {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { id, language } = req.query;

      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: session.id },
      });

      if (!studentProfile) {
        return res.status(404).json({ success: false, message: "Student profile not found" });
      }

      if (id && typeof id === "string") {
        await prisma.studentProgrammingLanguage.delete({
          where: { id },
        });
      } else if (language && typeof language === "string") {
        await prisma.studentProgrammingLanguage.delete({
          where: {
            studentProfileId_language: {
              studentProfileId: studentProfile.id,
              language,
            },
          },
        });
      } else {
        return res.status(400).json({ success: false, message: "Language ID or name required" });
      }

      return res.status(200).json({
        success: true,
        message: "Programming language removed successfully",
      });
    } catch (error: any) {
      console.error("Error deleting programming language:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error deleting programming language",
      });
    }
  }

  return res.status(405).json({ success: false, message: "Method not allowed" });
}
