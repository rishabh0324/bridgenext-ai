import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/auth";

export const TARGET_CAREER_OPTIONS = [
  { id: "soft-dev", title: "Software Developer", category: "Core Software", description: "Design, build, and optimize enterprise applications & system architectures." },
  { id: "full-stack", title: "Full Stack Developer", category: "Web & Cloud", description: "End-to-end full stack architecture from React frontends to scalable microservices." },
  { id: "frontend-dev", title: "Frontend Developer", category: "Web & Mobile", description: "High-performance UI/UX engineering, design systems, and web performance optimization." },
  { id: "backend-dev", title: "Backend Developer", category: "Systems & Cloud", description: "Distributed APIs, database schemas, message queues, and high-concurrency services." },
  { id: "data-scientist", title: "Data Scientist", category: "Data & AI", description: "Statistical modeling, predictive algorithms, data pipelines, and quantitative research." },
  { id: "data-analyst", title: "Data Analyst", category: "Data & Insights", description: "Business intelligence dashboards, SQL transformations, and metrics tracking." },
  { id: "aiml-eng", title: "AI/ML Engineer", category: "AI & Deep Learning", description: "PyTorch neural networks, LLMs, transformer fine-tuning, and RAG systems." },
  { id: "cyber-eng", title: "Cybersecurity Engineer", category: "Security & SecOps", description: "Penetration testing, cloud IAM policies, encryption, and zero-trust security." },
  { id: "cloud-eng", title: "Cloud Engineer", category: "Infrastructure", description: "AWS/GCP/Azure architecture, serverless infrastructure, and high availability." },
  { id: "devops-eng", title: "DevOps Engineer", category: "DevOps & SRE", description: "CI/CD pipelines, Kubernetes orchestration, Dockerization, and observability." },
  { id: "uiux-designer", title: "UI/UX Designer", category: "Design & Product", description: "Design systems, user journeys, wireframes, and interactive prototyping." },
  { id: "product-manager", title: "Product Manager", category: "Strategy & Agile", description: "Product roadmap definition, feature prioritizing, and user metric optimization." },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token =
    req.cookies.sih_token ||
    req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const session = token ? verifyJwtToken(token) : null;

  if (req.method === "GET") {
    try {
      const studentId = (req.query.studentId as string) || (session?.id);

      let selectedCareers: string[] = ["Software Developer", "Full Stack Developer"];

      if (studentId) {
        const studentProfile = await prisma.studentProfile.findFirst({
          where: {
            OR: [
              { id: studentId },
              { userId: studentId },
            ],
          },
        });

        if (studentProfile?.targetCareersJson) {
          try {
            selectedCareers = JSON.parse(studentProfile.targetCareersJson);
          } catch (e) {
            selectedCareers = [studentProfile.targetJobRole || "Software Developer"];
          }
        } else if (studentProfile?.targetJobRole) {
          selectedCareers = [studentProfile.targetJobRole];
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          availableOptions: TARGET_CAREER_OPTIONS,
          selectedCareers,
        },
      });
    } catch (error: any) {
      console.error("Error fetching target careers:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error fetching target careers",
      });
    }
  }

  if (req.method === "POST") {
    try {
      if (!session || session.role !== "STUDENT") {
        return res.status(401).json({
          success: false,
          message: "Only authenticated students can update target careers",
        });
      }

      const { selectedCareers } = req.body;

      if (!Array.isArray(selectedCareers) || selectedCareers.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please select at least one target career option",
        });
      }

      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: session.id },
      });

      if (!studentProfile) {
        return res.status(404).json({ success: false, message: "Student profile not found" });
      }

      const updated = await prisma.studentProfile.update({
        where: { id: studentProfile.id },
        data: {
          targetJobRole: selectedCareers[0],
          targetCareersJson: JSON.stringify(selectedCareers),
        },
      });

      return res.status(200).json({
        success: true,
        message: "Target careers updated successfully in BridgeNext AI profile",
        data: {
          targetJobRole: updated.targetJobRole,
          targetCareers: selectedCareers,
        },
      });
    } catch (error: any) {
      console.error("Error saving target careers:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error updating target careers",
      });
    }
  }

  return res.status(405).json({ success: false, message: "Method not allowed" });
}
