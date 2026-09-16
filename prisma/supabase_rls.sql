-- Supabase PostgreSQL Row Level Security (RLS) Policies
-- SIH 2026 Problem Statement 44: BridgeNext AI Platform

-- Enable RLS on core tables
ALTER TABLE IF EXISTS "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "StudentProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "IndustryProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "FacultyProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "InstitutionProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "StudentSkill" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "StudentProgrammingLanguage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "FacultyEndorsement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "JobPosting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "JobApplication" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "MentorshipSlot" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "MentorshipBooking" ENABLE ROW LEVEL SECURITY;

-- 1. User & Profiles: Users can view public metadata, but can only update their own profile
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON "User" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own user record"
  ON "User" FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id OR auth.uid()::text = "authUserId");

-- 2. Student Skills & Programming Languages: Students can manage self-reported skills
CREATE POLICY "Student skills viewable by authenticated users"
  ON "StudentSkill" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Students can insert their own skills"
  ON "StudentSkill" FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "StudentProfile" sp
      JOIN "User" u ON sp."userId" = u.id
      WHERE sp.id = "studentProfileId"
      AND (u.id = auth.uid()::text OR u."authUserId" = auth.uid()::text)
    )
  );

-- 3. Faculty Endorsements: ONLY Faculty or Admin can create/modify endorsements
CREATE POLICY "Endorsements viewable by all authenticated users"
  ON "FacultyEndorsement" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only Faculty or Admin can insert endorsements"
  ON "FacultyEndorsement" FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "User" u
      WHERE (u.id = auth.uid()::text OR u."authUserId" = auth.uid()::text)
      AND u.role IN ('FACULTY', 'ADMIN', 'INSTITUTION')
    )
  );

-- 4. Job Applications: Students can create applications if eligible; Industry can review
CREATE POLICY "Students can view own applications"
  ON "JobApplication" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "StudentProfile" sp
      JOIN "User" u ON sp."userId" = u.id
      WHERE sp.id = "studentProfileId"
      AND (u.id = auth.uid()::text OR u."authUserId" = auth.uid()::text)
    )
    OR
    EXISTS (
      SELECT 1 FROM "JobPosting" jp
      JOIN "IndustryProfile" ip ON jp."industryProfileId" = ip.id
      JOIN "User" u ON ip."userId" = u.id
      WHERE jp.id = "jobPostingId"
      AND (u.id = auth.uid()::text OR u."authUserId" = auth.uid()::text)
    )
    OR
    EXISTS (
      SELECT 1 FROM "User" u
      WHERE (u.id = auth.uid()::text OR u."authUserId" = auth.uid()::text)
      AND u.role IN ('ADMIN', 'INSTITUTION')
    )
  );

-- 5. Mentorship Guidance Slots: Faculty manage slots, Students book slots
CREATE POLICY "Guidance slots viewable by all authenticated"
  ON "MentorshipSlot" FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Faculty can create guidance slots"
  ON "MentorshipSlot" FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "FacultyProfile" fp
      JOIN "User" u ON fp."userId" = u.id
      WHERE fp.id = "facultyProfileId"
      AND (u.id = auth.uid()::text OR u."authUserId" = auth.uid()::text)
      AND u.role IN ('FACULTY', 'ADMIN')
    )
  );
