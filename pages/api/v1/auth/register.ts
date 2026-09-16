import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { hashPassword, signJwtToken, getUserWithProfile } from "@/lib/auth";
import { UserRole } from "@/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phone,
      role,
      collegeName,
      institutionName,
      companyName,
      degree,
      cgpa,
      department,
      graduationYear,
    } = req.body;

    // 1. Basic Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter your full name (at least 2 characters).",
      });
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid official or academic email address.",
      });
    }

    // Phone validation: exactly 10 digits
    if (phone) {
      const cleanPhone = phone.toString().replace(/[\s\-\+\(\)]/g, "");
      const tenDigitPhone = cleanPhone.length > 10 && cleanPhone.startsWith("91") ? cleanPhone.slice(2) : cleanPhone;
      if (!/^\d{10}$/.test(tenDigitPhone)) {
        return res.status(400).json({
          success: false,
          message: "Phone number must be exactly 10 digits (numeric only).",
        });
      }
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match. Please re-enter your password.",
      });
    }

    // 2. Role Normalization & Security Check
    let targetRole: UserRole = "STUDENT";
    const roleUpper = (role?.toString().toUpperCase() || "STUDENT").trim();

    if (roleUpper === "STUDENT") {
      targetRole = "STUDENT";
    } else if (roleUpper === "INDUSTRY" || roleUpper === "RECRUITER") {
      targetRole = "INDUSTRY";
    } else if (roleUpper === "FACULTY" || roleUpper === "TPO/FACULTY" || roleUpper === "TPO_FACULTY") {
      targetRole = "FACULTY";
    } else if (roleUpper === "INSTITUTION" || roleUpper === "TPO") {
      targetRole = "INSTITUTION";
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified. Supported roles: STUDENT, INDUSTRY, TPO / FACULTY.",
      });
    }

    // CGPA Validation for Student: 0.0 to 10.0
    let parsedCgpa = 8.5;
    if (targetRole === "STUDENT" && cgpa !== undefined && cgpa !== null && cgpa !== "") {
      const numCgpa = parseFloat(cgpa);
      if (isNaN(numCgpa) || numCgpa < 0 || numCgpa > 10) {
        return res.status(400).json({
          success: false,
          message: "CGPA must be a valid number between 0.0 and 10.0.",
        });
      }
      parsedCgpa = numCgpa;
    }

    // 3. Check for Existing Account
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists. Please sign in instead.",
      });
    }

    // 4. Hash Password
    const passwordHash = await hashPassword(password);

    // Cleaned 10-digit phone
    let formattedPhone = phone ? phone.toString().replace(/[\s\-\+\(\)]/g, "") : null;
    if (formattedPhone && formattedPhone.length > 10 && formattedPhone.startsWith("91")) {
      formattedPhone = formattedPhone.slice(2);
    }

    // 5. Create User & Profile in Database Transaction
    const currentYear = new Date().getFullYear();
    const studentDegree = degree || "B.Tech";
    const degreeDuration = studentDegree === "B.Tech" ? 4 : studentDegree === "M.Tech" ? 2 : 3;
    const computedGradYear = graduationYear ? Number(graduationYear) : currentYear + degreeDuration;

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: formattedPhone,
          passwordHash,
          role: targetRole,
          isOnboarded: true, // Fully populated at registration
        },
      });

      if (targetRole === "STUDENT") {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            collegeName: collegeName?.trim() || institutionName?.trim() || "National Institute of Technology",
            degree: studentDegree,
            department: department?.trim() || "Computer Science & Engineering",
            cgpa: parsedCgpa,
            graduationYear: computedGradYear,
            targetJobRole: "Software Developer",
            targetCareersJson: JSON.stringify(["Software Developer", "Full Stack Developer"]),
          },
        });
      } else if (targetRole === "INDUSTRY") {
        await tx.industryProfile.create({
          data: {
            userId: user.id,
            companyName: companyName?.trim() || "Enterprise Partner",
            companyWebsite: "https://company.example.com",
            designation: "Talent Acquisition Lead",
          },
        });
      } else if (targetRole === "FACULTY") {
        await tx.facultyProfile.create({
          data: {
            userId: user.id,
            institutionName: institutionName?.trim() || collegeName?.trim() || "National Institute of Technology",
            department: department?.trim() || "Computer Science & Engineering",
            designation: "Associate Professor & Mentor",
          },
        });
      } else if (targetRole === "INSTITUTION") {
        await tx.institutionProfile.create({
          data: {
            userId: user.id,
            institutionName: institutionName?.trim() || collegeName?.trim() || "National Institute of Technology",
            institutionType: "Tier-1 Engineering Institution",
          },
        });
      }

      return user;
    });

    const userWithProfile = await getUserWithProfile(newUser.id);
    if (!userWithProfile) {
      throw new Error("Failed to load created user profile");
    }

    const token = signJwtToken(userWithProfile);

    res.setHeader(
      "Set-Cookie",
      `sih_token=${token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome to BridgeNext AI.",
      data: {
        user: userWithProfile,
        token,
        isOnboarded: true,
      },
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during registration. Please try again.",
    });
  }
}
