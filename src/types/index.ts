export type UserRole = "STUDENT" | "INDUSTRY" | "FACULTY" | "INSTITUTION" | "ADMIN";

export interface ProgrammingLanguageItem {
  id?: string;
  studentProfileId?: string;
  language: string;
  proficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert" | string;
  verificationStatus?: "SELF_REPORTED" | "FACULTY_ENDORSED" | "ASSESSMENT_VERIFIED" | string;
  verifiedScore?: number | null;
  relatedProjects?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TargetCareerOption {
  id: string;
  title: string;
  category?: string;
  description?: string;
  icon?: string;
}

export interface StudentProfileData {
  id?: string;
  userId?: string;
  collegeName: string;
  university?: string | null;
  degree: string;
  department: string;
  currentYear?: number | null;
  currentSemester?: number | null;
  graduationYear: number;
  cgpa?: number | null;
  rollNo?: string | null;
  bio?: string | null;
  targetJobRole?: string | null;
  targetCareersJson?: string | null;
  targetCareers?: string[];
  preferredLocation?: string | null;
  preferredIndustry?: string | null;
  softSkills?: string | null;
  certifications?: string | null;
  experienceSummary?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  skills?: any[];
  programmingLanguages?: ProgrammingLanguageItem[];
  projects?: any[];
  roadmaps?: any[];
  applications?: any[];
  [key: string]: any;
}

export interface IndustryProfileData {
  id?: string;
  userId?: string;
  companyName: string;
  companyWebsite: string;
  designation?: string | null;
  domain?: string | null;
  companyDescription?: string | null;
  companySize?: string | null;
  location?: string | null;
  hiringAreas?: string | null;
  skillsRequired?: string | null;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  jobPostings?: any[];
  [key: string]: any;
}

export interface FacultyProfileData {
  id?: string;
  userId?: string;
  institutionName: string;
  department: string;
  designation: string;
  qualifications?: string | null;
  specialization?: string | null;
  researchInterests?: string | null;
  mentorshipAreas?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  mentorshipSlots?: any[];
  endorsements?: any[];
  [key: string]: any;
}

export interface InstitutionProfileData {
  id?: string;
  userId?: string;
  tpoName?: string | null;
  tpoDesignation?: string | null;
  institutionName: string;
  institutionType: string;
  universityAffiliation?: string | null;
  officialEmail?: string | null;
  website?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  departmentsList?: string | null;
  studentPopulation?: number | null;
  code?: string | null;
  nirfRank?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any;
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  isOnboarded: boolean;
  studentProfile?: StudentProfileData | null;
  industryProfile?: IndustryProfileData | null;
  facultyProfile?: FacultyProfileData | null;
  institutionProfile?: InstitutionProfileData | null;
  [key: string]: any;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: UserSession;
    token?: string;
    isOnboarded?: boolean;
  };
  errors?: any;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
  role: "STUDENT" | "INDUSTRY" | "FACULTY" | "INSTITUTION" | UserRole;
  [key: string]: any;
}

export interface LoginPayload {
  email: string;
  password: string;
  [key: string]: any;
}

export interface OnboardingPayload {
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  collegeName?: string;
  university?: string;
  degree?: string;
  department?: string;
  currentYear?: number;
  currentSemester?: number;
  graduationYear?: number;
  cgpa?: number;
  rollNo?: string;
  skills?: { name: string; category?: string; selfScore?: number }[];
  softSkills?: string;
  certifications?: string;
  experienceSummary?: string;
  targetJobRole?: string;
  preferredLocation?: string;
  preferredIndustry?: string;

  designation?: string;
  companyName?: string;
  companyWebsite?: string;
  domain?: string;
  companyDescription?: string;
  companySize?: string;
  location?: string;
  hiringAreas?: string;
  skillsRequired?: string;

  institutionName?: string;
  qualifications?: string;
  specialization?: string;
  researchInterests?: string;
  mentorshipAreas?: string;

  tpoName?: string;
  tpoDesignation?: string;
  institutionType?: string;
  universityAffiliation?: string;
  officialEmail?: string;
  website?: string;
  city?: string;
  state?: string;
  address?: string;
  departmentsList?: string;
  studentPopulation?: number;
  code?: string;
  nirfRank?: number;
}

// Domain Model Types for Platform Services
export interface SkillItem {
  id: string;
  name: string;
  category?: string;
  description?: string;
  score?: number;
  proficiencyLevel?: any;
  verificationStatus?: string;
  selfScore?: number;
  verifiedScore?: number;
  industryBenchmark?: number;
  isVerified?: boolean;
  badgeEarned?: string;
  verifiedAt?: string | Date;
  [key: string]: any;
}

export interface AssessmentItem {
  id: string;
  skillId?: string;
  title: string;
  skillName?: string;
  category?: string;
  difficulty?: string;
  difficultyLevel?: string;
  durationMinutes?: number;
  durationMins?: number;
  totalQuestions?: number;
  passingScore?: number;
  badgeReward?: string;
  status?: string;
  score?: number;
  isCompleted?: boolean;
  bestScore?: number;
  isPassed?: boolean;
  questions?: {
    id: string;
    text?: string;
    questionText?: string;
    options: string[];
    correctIndex?: number;
  }[];
  [key: string]: any;
}

export interface TargetRoleData {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  avgSalaryRange: string;
  industryDemandLevel: "HIGH" | "VERY HIGH" | "CRITICAL" | string;
  icon?: string | null;
  requiredSkills: {
    name: string;
    minBenchmark?: number;
    weight: number;
    isMandatory: boolean;
    category?: string;
  }[];
}

export interface TargetRoleItem extends TargetRoleData {}

export interface SkillGapItemData {
  skillName: string;
  category: string;
  studentScore: number;
  targetBenchmark: number;
  weight: number;
  isMandatory: boolean;
  gapDelta: number;
  gapStatus: "MATCHED" | "MODERATE_GAP" | "CRITICAL_GAP";
  verificationStatus: "ASSESSMENT_VERIFIED" | "FACULTY_ENDORSED" | "SELF_REPORTED" | "MISSING";
  hasAssessment: boolean;
  assessmentId?: string;
}

export interface RoadmapStep {
  id: string;
  stepNumber?: number;
  week?: number;
  title: string;
  description: string;
  skillName?: string;
  gapDelta?: number;
  resourceType: string;
  resourceUrl: string;
  provider?: string | null;
  estimatedHours?: number;
  isCompleted: boolean;
  completedAt?: string | null;
  [key: string]: any;
}

export interface RoadmapMilestoneItem extends RoadmapStep {}

export interface LearningRoadmapData {
  id: string;
  targetRoleId?: string | null;
  targetRole?: string;
  roleTitle?: string;
  roleCategory?: string | null;
  overallFitScore?: number;
  cosineSimilarity?: number;
  estimatedWeeks?: number;
  estimatedHours?: number;
  summary?: string;
  gapSummary?: string;
  progressPercent?: number;
  strengthsCount?: number;
  moderateGapsCount?: number;
  criticalGapsCount?: number;
  gaps?: SkillGapItemData[];
  steps: RoadmapStep[];
  milestones?: RoadmapStep[];
  status?: string;
  createdAt?: string | Date;
  [key: string]: any;
}

export interface RoadmapItem extends LearningRoadmapData {}

export interface JobPostingItem {
  id: string;
  title: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  type?: string;
  jobType?: string;
  status?: string;
  stipendOrSalary?: string;
  stipendSalary?: string;
  minCgpa: number;
  deadline?: string | Date;
  requiredSkills: {
    name?: string;
    skillName?: string;
    minBenchmark?: number;
    weight: number;
    isMandatory?: boolean;
    [key: string]: any;
  }[];
  applicantCount?: number;
  hasApplied?: boolean;
  isApplied?: boolean;
  userMatchScore?: number;
  matchScore?: number;
  vectorMatchScore?: number;
  applicationStatus?: string;
  [key: string]: any;
}

export interface CandidateItem {
  id: string;
  studentId?: string;
  name: string;
  email: string;
  collegeName?: string;
  degree?: string;
  department?: string;
  cgpa: number;
  avatarUrl?: string;
  vectorMatchScore?: number;
  matchScore?: number;
  verifiedSkills?: any[];
  skills?: any[];
  status: string;
  appliedAt: string;
  [key: string]: any;
}

export interface MentorshipSessionItem {
  id: string;
  studentName: string;
  studentEmail?: string;
  studentAvatar?: string;
  facultyName?: string;
  topic: string;
  scheduledAt: string;
  durationMinutes?: number;
  status: string;
  meetingLink?: string;
  notes?: string;
  [key: string]: any;
}

export interface InstitutionAnalytics {
  totalStudents: number;
  verifiedSkillsCount?: number;
  industryPartnersCount?: number;
  averageReadinessScore?: number;
  placementRateProjected?: number;
  placementReadyPercentage?: number;
  activeRecruiters?: number;
  totalOffers?: number;
  skillDemandVsSupply?: any;
  departmentReadiness?: {
    department: string;
    total?: number;
    ready?: number;
    avgScore?: number;
    totalStudents?: number;
    readinessPercentage?: number;
    readinessScore?: number;
    tier1Count?: number;
    [key: string]: any;
  }[];
  skillSupplyVsDemand?: {
    skill: string;
    industryDemand: number;
    studentSupply: number;
    [key: string]: any;
  }[];
  [key: string]: any;
}
