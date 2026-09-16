import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserRole, UserSession } from "@/types";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "sih2026-super-secret-jwt-key-academia-industry-platform";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwtToken(payload: UserSession): string {
  const options: SignOptions = {
    expiresIn: "7d",
  };
  // Store only essential user identity metadata in JWT to keep cookie size minimal
  const tokenPayload = {
    id: payload.id,
    email: payload.email,
    name: payload.name,
    phone: payload.phone,
    role: payload.role,
    avatarUrl: payload.avatarUrl,
    isOnboarded: payload.isOnboarded,
  };
  return jwt.sign(tokenPayload, JWT_SECRET, options);
}

export function verifyJwtToken(token: string): UserSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getUserWithProfile(userId: string): Promise<UserSession | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: {
            skills: { include: { skill: true } },
            programmingLanguages: true,
            projects: true,
            roadmaps: { include: { milestones: true } },
          },
        },
        industryProfile: {
          include: {
            jobPostings: true,
          },
        },
        facultyProfile: {
          include: {
            mentorshipSlots: true,
            endorsements: true,
          },
        },
        institutionProfile: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || undefined,
      role: user.role as UserRole,
      avatarUrl: user.avatarUrl || undefined,
      isOnboarded: user.isOnboarded,
      studentProfile: user.studentProfile || undefined,
      industryProfile: user.industryProfile || undefined,
      facultyProfile: user.facultyProfile || undefined,
      institutionProfile: user.institutionProfile || undefined,
    };
  } catch (error) {
    return null;
  }
}
