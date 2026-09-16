export interface TargetRoleSkillRequirement {
  name: string;
  minBenchmark: number;
  weight: number; // 1 - 5 (5 = critical/mandatory)
  isMandatory: boolean;
  category?: string;
  suggestedResources?: {
    title: string;
    description: string;
    resourceType: "VIDEO" | "PROJECT" | "ARTICLE" | "DOCS" | "CERTIFICATION" | "LAB" | "COURSE";
    resourceUrl: string;
    provider?: string;
    estimatedHours?: number;
  }[];
}

export interface SkillGapItem {
  skillName: string;
  category: string;
  studentScore: number;
  targetBenchmark: number;
  weight: number;
  isMandatory: boolean;
  gapDelta: number; // studentScore - targetBenchmark (e.g. -20%)
  gapStatus: "MATCHED" | "MODERATE_GAP" | "CRITICAL_GAP";
  verificationStatus: "ASSESSMENT_VERIFIED" | "FACULTY_ENDORSED" | "SELF_REPORTED" | "MISSING";
  hasAssessment: boolean;
  assessmentId?: string;
}

export interface MilestoneDraft {
  stepNumber: number;
  title: string;
  description: string;
  skillName: string;
  gapDelta: number;
  resourceType: "VIDEO" | "PROJECT" | "ARTICLE" | "DOCS" | "CERTIFICATION" | "LAB" | "COURSE";
  resourceUrl: string;
  provider: string;
  estimatedHours: number;
  isCompleted?: boolean;
}

export interface VectorAnalysisResult {
  roleTitle: string;
  roleCategory: string;
  overallFitScore: number; // 0 - 100%
  cosineSimilarity: number; // 0.000 - 1.000
  gapSummary: string;
  estimatedWeeks: number;
  estimatedHours: number;
  strengthsCount: number;
  moderateGapsCount: number;
  criticalGapsCount: number;
  gaps: SkillGapItem[];
  milestones: MilestoneDraft[];
}

/**
 * Calculates Cosine Similarity between two multi-dimensional competency vectors:
 * cos(theta) = (A . B) / (||A|| * ||B||)
 */
export function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
    return 0.0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0.0;

  const similarity = dotProduct / denominator;
  return Math.min(1.0, Math.max(0.0, Number(similarity.toFixed(4))));
}

/**
 * High-quality curated learning resources for core engineering domains
 */
export const CURATED_RESOURCE_CATALOG: Record<string, MilestoneDraft[]> = {
  "Docker & Containerization": [
    {
      stepNumber: 1,
      title: "Master Multi-Stage Docker Builds & Microservices Containerization",
      description: "Learn how to optimize production container images under 100MB with Alpine Linux, layer caching, and multi-stage pipelines.",
      skillName: "Docker & Containerization",
      gapDelta: -15.0,
      resourceType: "VIDEO",
      resourceUrl: "https://www.youtube.com/watch?v=gAkwW2tuIqE",
      provider: "freeCodeCamp / Docker Docs",
      estimatedHours: 8,
    },
    {
      stepNumber: 2,
      title: "Hands-on Project: Multi-Container Microservice Stack with Docker Compose",
      description: "Containerize a Next.js frontend, Python FastAPI backend, Redis cache, and PostgreSQL database with health checks and volume persistence.",
      skillName: "Docker & Containerization",
      gapDelta: -15.0,
      resourceType: "PROJECT",
      resourceUrl: "https://github.com/docker/awesome-compose",
      provider: "GitHub Labs",
      estimatedHours: 12,
    },
  ],
  "Kubernetes & Cloud Infra": [
    {
      stepNumber: 1,
      title: "Kubernetes Cluster Architecture, Pods, Deployments & Services",
      description: "Understand declarative infrastructure, Helm charts, Ingress routing, and zero-downtime rolling deployments.",
      skillName: "Kubernetes & Cloud Infra",
      gapDelta: -25.0,
      resourceType: "DOCS",
      resourceUrl: "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
      provider: "Kubernetes Official Docs",
      estimatedHours: 10,
    },
    {
      stepNumber: 2,
      title: "Capstone Lab: Cloud Native Automated CI/CD & Cluster Observability",
      description: "Deploy an end-to-end GitOps workflow with GitHub Actions, ArgoCD, and Prometheus telemetry.",
      skillName: "Kubernetes & Cloud Infra",
      gapDelta: -25.0,
      resourceType: "LAB",
      resourceUrl: "https://github.com/argoproj/argo-cd",
      provider: "Cloud Native Foundation",
      estimatedHours: 14,
    },
  ],
  "Machine Learning & PyTorch": [
    {
      stepNumber: 1,
      title: "PyTorch Deep Learning & Tensor Operations Mastery",
      description: "Implement custom neural network architectures, backpropagation, and loss optimizers from scratch.",
      skillName: "Machine Learning & PyTorch",
      gapDelta: -20.0,
      resourceType: "COURSE",
      resourceUrl: "https://pytorch.org/tutorials/beginner/basics/intro.html",
      provider: "PyTorch Official",
      estimatedHours: 10,
    },
    {
      stepNumber: 2,
      title: "Hands-on Project: Vector Embeddings & Cosine Recommendation Engine",
      description: "Train sentence transformer embeddings and build an ultra-fast sub-50ms candidate vector matching search engine.",
      skillName: "Machine Learning & PyTorch",
      gapDelta: -20.0,
      resourceType: "PROJECT",
      resourceUrl: "https://github.com/huggingface/transformers",
      provider: "HuggingFace Hub",
      estimatedHours: 12,
    },
  ],
  "Redis & Distributed Caching": [
    {
      stepNumber: 1,
      title: "Redis In-Memory Architecture, Pub/Sub & Token Bucket Rate Limiting",
      description: "Configure distributed session state, caching strategies (Write-Through vs Cache-Aside), and Redis Streams.",
      skillName: "Redis & Distributed Caching",
      gapDelta: -15.0,
      resourceType: "DOCS",
      resourceUrl: "https://redis.io/docs/data-types/",
      provider: "Redis University",
      estimatedHours: 6,
    },
  ],
  "Data Structures & Algorithms": [
    {
      stepNumber: 1,
      title: "Advanced Graph Algorithms & Dynamic Programming for Tier-1 Systems",
      description: "Master Dijkstra, Topological Sort, Segment Trees, and Asymptotic Complexity Optimization.",
      skillName: "Data Structures & Algorithms",
      gapDelta: -10.0,
      resourceType: "ARTICLE",
      resourceUrl: "https://neetcode.io/roadmap",
      provider: "NeetCode / LeetCode Tier-1",
      estimatedHours: 12,
    },
  ],
  "React.js & Next.js": [
    {
      stepNumber: 1,
      title: "Advanced Next.js App Router, RSC & Performance Profiling",
      description: "Master React Server Components, Streaming SSR, Suspense boundaries, and Web Vitals optimization.",
      skillName: "React.js & Next.js",
      gapDelta: -10.0,
      resourceType: "DOCS",
      resourceUrl: "https://nextjs.org/docs",
      provider: "Next.js Official Documentation",
      estimatedHours: 6,
    },
  ],
  "Python & Fast-API": [
    {
      stepNumber: 1,
      title: "High-Throughput Asynchronous Microservices with FastAPI & Pydantic",
      description: "Build async REST APIs with Dependency Injection, connection pooling, and automated OpenAPI documentation.",
      skillName: "Python & Fast-API",
      gapDelta: -10.0,
      resourceType: "COURSE",
      resourceUrl: "https://fastapi.tiangolo.com/tutorial/",
      provider: "FastAPI Documentation",
      estimatedHours: 6,
    },
  ],
  "PostgreSQL & Prisma ORM": [
    {
      stepNumber: 1,
      title: "Relational Modeling, Composite Indexing & ACID Transactions",
      description: "Query execution plan analysis (EXPLAIN ANALYZE), B-Tree vs GIN indexing, and Prisma query tuning.",
      skillName: "PostgreSQL & Prisma ORM",
      gapDelta: -10.0,
      resourceType: "DOCS",
      resourceUrl: "https://www.prisma.io/docs/guides/performance-and-optimization",
      provider: "Prisma Data Platform",
      estimatedHours: 6,
    },
  ],
};

/**
 * Computes comprehensive multi-dimensional AI Skill-Gap Analysis:
 * - Cosine vector similarity between target requirements and student competencies
 * - Weighted fit score accounting for verification tiers (verified > self-reported > missing)
 * - Individual gap identification with severity classifications
 * - Dynamic milestone generation to bridge specific deficits
 */
export function computeSkillGapAnalysis(
  studentSkills: any[],
  targetRole: {
    title: string;
    category?: string;
    requiredSkillsJson: string | TargetRoleSkillRequirement[];
  },
  availableAssessments: any[] = []
): VectorAnalysisResult {
  const requirements: TargetRoleSkillRequirement[] =
    typeof targetRole.requiredSkillsJson === "string"
      ? JSON.parse(targetRole.requiredSkillsJson)
      : targetRole.requiredSkillsJson;

  const studentSkillMap = new Map<string, any>();
  for (const s of studentSkills) {
    const key = (s.name || s.skill?.name || "").trim().toLowerCase();
    if (key) {
      studentSkillMap.set(key, s);
    }
  }

  const assessmentMap = new Map<string, any>();
  for (const a of availableAssessments) {
    const key = (a.skillName || a.skill?.name || "").trim().toLowerCase();
    if (key) {
      assessmentMap.set(key, a);
    }
  }

  const studentVector: number[] = [];
  const targetVector: number[] = [];

  const gaps: SkillGapItem[] = [];
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const req of requirements) {
    const reqKey = req.name.trim().toLowerCase();
    let matchingRecord: any = null;

    // Direct match or partial match
    for (const [sKey, sVal] of Array.from(studentSkillMap.entries())) {
      if (sKey === reqKey || sKey.includes(reqKey) || reqKey.includes(sKey)) {
        matchingRecord = sVal;
        break;
      }
    }

    const targetBenchmark = req.minBenchmark || 80.0;
    const weight = req.weight || 3;
    const isMandatory = req.isMandatory || false;

    let studentScore = 0;
    let verificationStatus: "ASSESSMENT_VERIFIED" | "FACULTY_ENDORSED" | "SELF_REPORTED" | "MISSING" = "MISSING";
    let scoreMultiplier = 1.0;

    if (matchingRecord) {
      const vScore = matchingRecord.verifiedScore;
      const sScore = matchingRecord.selfScore;
      const vStatus = matchingRecord.verificationStatus || (matchingRecord.isVerified ? "ASSESSMENT_VERIFIED" : "SELF_REPORTED");

      if (vStatus === "ASSESSMENT_VERIFIED" && vScore != null) {
        studentScore = Number(vScore);
        verificationStatus = "ASSESSMENT_VERIFIED";
        scoreMultiplier = 1.0;
      } else if (vStatus === "FACULTY_ENDORSED" && vScore != null) {
        studentScore = Number(vScore);
        verificationStatus = "FACULTY_ENDORSED";
        scoreMultiplier = 0.95;
      } else if (sScore != null) {
        studentScore = Number(sScore);
        verificationStatus = "SELF_REPORTED";
        scoreMultiplier = 0.85; // Self-reported has 85% confidence weighting
      } else {
        studentScore = 50.0;
        verificationStatus = "SELF_REPORTED";
        scoreMultiplier = 0.75;
      }
    } else {
      studentScore = 0.0;
      verificationStatus = "MISSING";
      scoreMultiplier = 0.0;
    }

    const gapDelta = Number((studentScore - targetBenchmark).toFixed(1));

    let gapStatus: "MATCHED" | "MODERATE_GAP" | "CRITICAL_GAP" = "MATCHED";
    if (gapDelta < -20 || (isMandatory && gapDelta < -5)) {
      gapStatus = "CRITICAL_GAP";
    } else if (gapDelta < 0) {
      gapStatus = "MODERATE_GAP";
    } else {
      gapStatus = "MATCHED";
    }

    const matchingAssessment = assessmentMap.get(reqKey);

    gaps.push({
      skillName: req.name,
      category: req.category || "Technical",
      studentScore,
      targetBenchmark,
      weight,
      isMandatory,
      gapDelta,
      gapStatus,
      verificationStatus,
      hasAssessment: !!matchingAssessment,
      assessmentId: matchingAssessment?.id,
    });

    studentVector.push(studentScore);
    targetVector.push(targetBenchmark);

    // Contribution to overall fit score
    const ratio = Math.min(1.2, studentScore / Math.max(1, targetBenchmark));
    const effectiveCredit = ratio * 100 * scoreMultiplier;
    totalWeightedScore += effectiveCredit * weight;
    totalWeight += weight;
  }

  // Calculate Cosine Similarity
  const cosineSimilarity = calculateCosineSimilarity(studentVector, targetVector);

  // Calculate Overall Fit Score (0 - 100%)
  const rawFit = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  const overallFitScore = Math.min(100, Math.max(0, Math.round(rawFit)));

  // Categorize counts
  const criticalGapsCount = gaps.filter((g) => g.gapStatus === "CRITICAL_GAP").length;
  const moderateGapsCount = gaps.filter((g) => g.gapStatus === "MODERATE_GAP").length;
  const strengthsCount = gaps.filter((g) => g.gapStatus === "MATCHED").length;

  // Generate Milestones
  const milestones = generateMilestonesForGaps(gaps, targetRole.title);

  const totalEstimatedHours = milestones.reduce((sum, m) => sum + m.estimatedHours, 0);
  const estimatedWeeks = Math.max(2, Math.ceil(totalEstimatedHours / 10)); // ~10 hours/week study pace

  // Synthesize AI Gap Summary
  const gapSummary = generateAIGapSummary(
    targetRole.title,
    overallFitScore,
    cosineSimilarity,
    gaps,
    criticalGapsCount,
    moderateGapsCount
  );

  return {
    roleTitle: targetRole.title,
    roleCategory: targetRole.category || "Engineering",
    overallFitScore,
    cosineSimilarity,
    gapSummary,
    estimatedWeeks,
    estimatedHours: totalEstimatedHours,
    strengthsCount,
    moderateGapsCount,
    criticalGapsCount,
    gaps,
    milestones,
  };
}

/**
 * Generates prioritized milestone steps to close candidate's specific competency deficits
 */
export function generateMilestonesForGaps(gaps: SkillGapItem[], roleTitle: string): MilestoneDraft[] {
  const sortedGaps = [...gaps]
    .filter((g) => g.gapStatus !== "MATCHED")
    .sort((a, b) => {
      // Mandatory first, then critical, then largest negative delta, then weight
      if (a.isMandatory !== b.isMandatory) return a.isMandatory ? -1 : 1;
      if (a.gapStatus === "CRITICAL_GAP" && b.gapStatus !== "CRITICAL_GAP") return -1;
      if (b.gapStatus === "CRITICAL_GAP" && a.gapStatus !== "CRITICAL_GAP") return 1;
      return a.gapDelta - b.gapDelta;
    });

  const milestoneDrafts: MilestoneDraft[] = [];
  let currentStep = 1;

  for (const gap of sortedGaps) {
    const catalogEntries = CURATED_RESOURCE_CATALOG[gap.skillName];
    if (catalogEntries && catalogEntries.length > 0) {
      for (const entry of catalogEntries) {
        milestoneDrafts.push({
          ...entry,
          stepNumber: currentStep++,
          gapDelta: gap.gapDelta,
          isCompleted: false,
        });
      }
    } else {
      // Dynamic fallback milestone for custom or new skills
      milestoneDrafts.push({
        stepNumber: currentStep++,
        title: `Comprehensive Mastery & Project Sprint: ${gap.skillName}`,
        description: `Bridge your ${Math.abs(gap.gapDelta)}% competency deficit in ${gap.skillName} by completing hands-on architectural implementations and design patterns.`,
        skillName: gap.skillName,
        gapDelta: gap.gapDelta,
        resourceType: "PROJECT",
        resourceUrl: `https://github.com/topics/${gap.skillName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        provider: "GitHub Open Source Blueprint",
        estimatedHours: 8,
        isCompleted: false,
      });
    }
  }

  // Capstone Milestone at the end if none exists
  if (milestoneDrafts.length > 0) {
    milestoneDrafts.push({
      stepNumber: currentStep++,
      title: `Capstone Milestone: Production-Grade ${roleTitle} Showcase Project`,
      description: `Integrate all verified competencies into a deployed, high-availability architecture with comprehensive CI/CD, documentation, and performance benchmarks.`,
      skillName: "System Design & Architecture",
      gapDelta: 0,
      resourceType: "CERTIFICATION",
      resourceUrl: "https://github.com/trending",
      provider: "NEP 2020 OBE Capstone Evaluation",
      estimatedHours: 12,
      isCompleted: false,
    });
  } else {
    // If student matches all skills 100%!
    milestoneDrafts.push({
      stepNumber: 1,
      title: `Tier-1 Corporate Placement Fast-Track Review`,
      description: `You satisfy all ${roleTitle} industry benchmarks! Review advanced distributed systems design patterns and prepare for high-frequency recruiter interviews.`,
      skillName: roleTitle,
      gapDelta: 0,
      resourceType: "CERTIFICATION",
      resourceUrl: "https://leetcode.com",
      provider: "bridgeNext ai Fast-Track",
      estimatedHours: 6,
      isCompleted: true,
    });
  }

  return milestoneDrafts;
}

/**
 * Synthesizes a natural language executive summary explaining vector results
 */
function generateAIGapSummary(
  roleTitle: string,
  fitScore: number,
  cosineSimilarity: number,
  gaps: SkillGapItem[],
  criticalCount: number,
  moderateCount: number
): string {
  const topStrengths = gaps.filter((g) => g.gapStatus === "MATCHED").map((g) => g.skillName);
  const criticalDeficits = gaps.filter((g) => g.gapStatus === "CRITICAL_GAP").map((g) => g.skillName);
  const moderateDeficits = gaps.filter((g) => g.gapStatus === "MODERATE_GAP").map((g) => g.skillName);

  let summary = `Vector Cosine Match: ${(cosineSimilarity * 100).toFixed(1)}% (${fitScore}% Overall Target Fit). `;

  if (topStrengths.length > 0) {
    summary += `Strong foundations demonstrated in ${topStrengths.slice(0, 3).join(", ")}. `;
  }

  if (criticalCount > 0) {
    summary += `Priority attention required in ${criticalDeficits.join(", ")} to reach Tier-1 recruiter shortlisting thresholds. `;
  } else if (moderateCount > 0) {
    summary += `Minor gap refinement needed in ${moderateDeficits.join(", ")} to reach 95%+ corporate readiness. `;
  } else {
    summary += `Outstanding alignment! You exceed all standard corporate benchmarks for this role. `;
  }

  return summary.trim();
}

export interface JobSkillRequirement {
  name: string;
  weight: number; // 1 - 5
  minBenchmark?: number;
  isMandatory?: boolean;
}

export interface JobMatchBreakdown {
  programmingLanguages: { earned: number; total: number };
  technicalSkills: { earned: number; total: number };
  projectExperience: { earned: number; total: number };
  skillVerification: { earned: number; total: number };
  careerAlignment: { earned: number; total: number };
}

export interface JobMatchResult {
  matchScore: number; // 0 - 100%
  vectorMatchScore: number;
  cosineSimilarity: number;
  meetsMandatorySkills: boolean;
  meetsMinCgpa: boolean;
  matchedSkills: {
    skillName: string;
    studentScore: number;
    requiredWeight: number;
    isMandatory: boolean;
    isVerified: boolean;
  }[];
  breakdown?: JobMatchBreakdown;
}

/**
 * Calculates zero-latency multi-factor ATS candidate vector match score for a job posting
 * powered by the BridgeNext AI Multi-Factor Matching Algorithm
 */
export function calculateJobMatchScore(
  studentSkills: any[],
  requiredSkills: JobSkillRequirement[] | string,
  studentCgpa?: number | null,
  minCgpa: number = 7.0
): JobMatchResult {
  const reqSkills: JobSkillRequirement[] =
    typeof requiredSkills === "string" ? JSON.parse(requiredSkills) : requiredSkills;

  const studentSkillMap = new Map<string, any>();
  for (const s of studentSkills) {
    const key = (s.name || s.skill?.name || "").trim().toLowerCase();
    if (key) {
      studentSkillMap.set(key, s);
    }
  }

  const studentVector: number[] = [];
  const targetVector: number[] = [];

  let totalWeightedScore = 0;
  let totalWeight = 0;
  let meetsMandatory = true;
  let verifiedCount = 0;

  const matchedSkills: {
    skillName: string;
    studentScore: number;
    requiredWeight: number;
    isMandatory: boolean;
    isVerified: boolean;
  }[] = [];

  for (const req of reqSkills) {
    const reqKey = req.name.trim().toLowerCase();
    let matchingRecord: any = null;

    for (const [sKey, sVal] of Array.from(studentSkillMap.entries())) {
      if (sKey === reqKey || sKey.includes(reqKey) || reqKey.includes(sKey)) {
        matchingRecord = sVal;
        break;
      }
    }

    const weight = req.weight || 3;
    const isMandatory = req.isMandatory || false;
    const minBenchmark = req.minBenchmark || 70.0;

    let studentScore = 0;
    let isVerified = false;
    let multiplier = 1.0;

    if (matchingRecord) {
      const vScore = matchingRecord.verifiedScore;
      const sScore = matchingRecord.selfScore;
      const vStatus = matchingRecord.verificationStatus || (matchingRecord.isVerified ? "ASSESSMENT_VERIFIED" : "SELF_REPORTED");

      if (vStatus === "ASSESSMENT_VERIFIED" && vScore != null) {
        studentScore = Number(vScore);
        isVerified = true;
        verifiedCount++;
        multiplier = 1.0;
      } else if (vStatus === "FACULTY_ENDORSED" && vScore != null) {
        studentScore = Number(vScore);
        isVerified = true;
        verifiedCount++;
        multiplier = 0.95;
      } else if (sScore != null) {
        studentScore = Number(sScore);
        multiplier = 0.85;
      } else {
        studentScore = 50.0;
        multiplier = 0.75;
      }
    } else {
      studentScore = 0.0;
      multiplier = 0.0;
    }

    if (isMandatory && studentScore < minBenchmark) {
      meetsMandatory = false;
    }

    studentVector.push(studentScore);
    targetVector.push(minBenchmark);

    const ratio = Math.min(1.2, studentScore / Math.max(1, minBenchmark));
    const effectiveCredit = ratio * 100 * multiplier;
    totalWeightedScore += effectiveCredit * weight;
    totalWeight += weight;

    matchedSkills.push({
      skillName: req.name,
      studentScore,
      requiredWeight: weight,
      isMandatory,
      isVerified,
    });
  }

  const cosineSimilarity = calculateCosineSimilarity(studentVector, targetVector);
  const rawScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  const matchScore = Math.min(100, Math.max(0, Math.round(rawScore)));
  const meetsMinCgpa = studentCgpa != null ? studentCgpa >= minCgpa : true;

  // Compute explainable breakdown
  const langPoints = Math.min(25, Math.round((matchScore / 100) * 25));
  const techPoints = Math.min(35, Math.round((matchScore / 100) * 35));
  const projPoints = Math.min(20, Math.round((matchScore / 100) * 20));
  const verifPoints = Math.min(10, Math.round((verifiedCount / Math.max(1, reqSkills.length)) * 10));
  const careerPoints = 10;

  return {
    matchScore,
    vectorMatchScore: matchScore,
    cosineSimilarity,
    meetsMandatorySkills: meetsMandatory,
    meetsMinCgpa,
    matchedSkills,
    breakdown: {
      programmingLanguages: { earned: langPoints, total: 25 },
      technicalSkills: { earned: techPoints, total: 35 },
      projectExperience: { earned: projPoints, total: 20 },
      skillVerification: { earned: verifPoints, total: 10 },
      careerAlignment: { earned: careerPoints, total: 10 },
    },
  };
}

