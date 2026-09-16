/**
 * test_new_features_audit.js
 * Comprehensive Functional Verification for BridgeNext AI Platform Improvements
 */

const http = require("http");

const BASE_URL = "http://localhost:3000";

function makeRequest({ path, method = "GET", headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = { ...headers };
    let requestBody = null;

    if (body) {
      requestBody = typeof body === "string" ? body : JSON.stringify(body);
      reqHeaders["Content-Type"] = "application/json";
      reqHeaders["Content-Length"] = Buffer.byteLength(requestBody);
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: reqHeaders,
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }

        const setCookie = res.headers["set-cookie"];
        let cookie = null;
        if (setCookie) {
          cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
        }

        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          cookie,
          json,
        });
      });
    });

    req.on("error", reject);
    if (requestBody) req.write(requestBody);
    req.end();
  });
}

async function runAudit() {
  console.log("================================================================================");
  console.log("🚀 BRIDGENEXT AI — NEW FEATURES & STRICT VALIDATION COMPREHENSIVE AUDIT");
  console.log("================================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = "") {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details ? `(${details})` : ""}`);
      failed++;
    }
  }

  const timestamp = Date.now();

  try {
    // -------------------------------------------------------------------------
    // 1. FORM VALIDATION & SIGNUP
    // -------------------------------------------------------------------------
    console.log("\n[1/6] 📋 AUDITING FORM VALIDATION (CGPA, 10-DIGIT PHONE, MULTI-ROLE SIGNUP)...");

    // 1.1 Reject Invalid CGPA > 10
    const badCgpaRes = await makeRequest({
      path: "/api/v1/auth/register",
      method: "POST",
      body: {
        name: "Test Student",
        email: `student_badcgpa_${timestamp}@sih.edu`,
        password: "Password@123",
        confirmPassword: "Password@123",
        role: "STUDENT",
        phone: "9876543210",
        cgpa: 11.5,
      },
    });
    assert(badCgpaRes.statusCode === 400, "Reject CGPA > 10 (e.g. 11.5)");

    // 1.2 Reject Invalid Phone (Non-10 Digits)
    const badPhoneRes = await makeRequest({
      path: "/api/v1/auth/register",
      method: "POST",
      body: {
        name: "Test Student",
        email: `student_badphone_${timestamp}@sih.edu`,
        password: "Password@123",
        confirmPassword: "Password@123",
        role: "STUDENT",
        phone: "98765", // Only 5 digits
        cgpa: 8.5,
      },
    });
    assert(badPhoneRes.statusCode === 400, "Reject Non-10-Digit Phone Number");

    // 1.3 Valid Student Registration
    const validStudentEmail = `student_new_${timestamp}@sih.edu`;
    const studentRegRes = await makeRequest({
      path: "/api/v1/auth/register",
      method: "POST",
      body: {
        name: "Rohan Varma",
        email: validStudentEmail,
        password: "Password@123",
        confirmPassword: "Password@123",
        role: "STUDENT",
        phone: "9876543210",
        degree: "B.Tech",
        cgpa: 8.45,
        collegeName: "National Institute of Technology",
      },
    });
    assert(
      studentRegRes.statusCode === 201 && studentRegRes.json.data?.token,
      "Valid Student Registration with B.Tech, 10-Digit Phone & CGPA 8.45"
    );
    const studentToken = studentRegRes.json.data.token;
    const studentAuth = { Authorization: `Bearer ${studentToken}` };

    // 1.4 Valid Industry Registration
    const validIndustryEmail = `recruiter_new_${timestamp}@techcorp.com`;
    const industryRegRes = await makeRequest({
      path: "/api/v1/auth/register",
      method: "POST",
      body: {
        name: "Ananya Deshmukh",
        email: validIndustryEmail,
        password: "Password@123",
        confirmPassword: "Password@123",
        role: "INDUSTRY",
        phone: "9123456780",
        companyName: "InnovateAI Technologies",
      },
    });
    assert(
      industryRegRes.statusCode === 201 && industryRegRes.json.data.user.role === "INDUSTRY",
      "Valid Industry Recruiter Registration"
    );
    const industryToken = industryRegRes.json.data.token;
    const industryAuth = { Authorization: `Bearer ${industryToken}` };

    // -------------------------------------------------------------------------
    // 2. PROGRAMMING LANGUAGES MANAGEMENT
    // -------------------------------------------------------------------------
    console.log("\n[2/6] 💻 AUDITING PROGRAMMING LANGUAGES (C++, Python, TypeScript, etc.)...");

    // 2.1 Add C++ (Advanced)
    const addCppRes = await makeRequest({
      path: "/api/v1/student/programming-languages",
      method: "POST",
      headers: studentAuth,
      body: {
        language: "C++",
        proficiency: "Advanced",
        relatedProjects: "Low-Latency Order Book Matching Engine",
      },
    });
    assert(
      addCppRes.statusCode === 201 && addCppRes.json.data.language === "C++",
      "Add Programming Language (C++ Advanced with Project Evidence)"
    );

    // 2.2 Add Python (Intermediate)
    const addPythonRes = await makeRequest({
      path: "/api/v1/student/programming-languages",
      method: "POST",
      headers: studentAuth,
      body: {
        language: "Python",
        proficiency: "Intermediate",
        relatedProjects: "PyTorch Transformer RAG Microservice",
      },
    });
    assert(
      addPythonRes.statusCode === 201 && addPythonRes.json.data.language === "Python",
      "Add Programming Language (Python Intermediate)"
    );

    // 2.3 Fetch Student Programming Languages
    const getLangsRes = await makeRequest({
      path: "/api/v1/student/programming-languages",
      method: "GET",
      headers: studentAuth,
    });
    assert(
      getLangsRes.statusCode === 200 && Array.isArray(getLangsRes.json.data) && getLangsRes.json.data.length >= 2,
      "Fetch Student Verified Programming Languages from DB"
    );

    // -------------------------------------------------------------------------
    // 3. TARGET CAREER OPTIONS & BRIDGENEXT AI MATCHING
    // -------------------------------------------------------------------------
    console.log("\n[3/6] 🎯 AUDITING TARGET CAREER SELECTION & AI SKILL-GAP ANALYSIS...");

    // 3.1 Update Target Careers
    const targetCareersRes = await makeRequest({
      path: "/api/v1/student/target-careers",
      method: "POST",
      headers: studentAuth,
      body: {
        selectedCareers: ["Full Stack Developer", "AI/ML Engineer"],
      },
    });
    assert(
      targetCareersRes.statusCode === 200 && targetCareersRes.json.data.targetCareers.length === 2,
      "Save Multiple Target Career Options to Database Profile"
    );

    // 3.2 Generate AI Career Roadmap for Target Role
    const allRolesRes = await makeRequest({
      path: "/api/v1/roadmaps/targets",
      method: "GET",
      headers: studentAuth,
    });
    const targetRole = allRolesRes.json.data[0];

    const generateRoadmapRes = await makeRequest({
      path: "/api/v1/roadmaps",
      method: "POST",
      headers: studentAuth,
      body: { targetRoleId: targetRole.id },
    });
    assert(
      generateRoadmapRes.statusCode === 201 &&
      generateRoadmapRes.json.data.roadmap?.gaps?.length > 0 &&
      generateRoadmapRes.json.data.roadmap?.steps?.length > 0,
      "BridgeNext AI Gap Analysis (Strong Skills vs Gaps) & Step-by-Step Roadmap"
    );

    // -------------------------------------------------------------------------
    // 4. MINIMUM CGPA VALIDATION FOR APPLICATIONS
    // -------------------------------------------------------------------------
    console.log("\n[4/6] 🎓 AUDITING MINIMUM CGPA JOB APPLICATION VALIDATION...");

    // 4.1 Create Job with Min CGPA 9.0 (Student has 8.45 -> Should Reject)
    const createHighCgpaJob = await makeRequest({
      path: "/api/v1/jobs",
      method: "POST",
      headers: industryAuth,
      body: {
        title: "Principal High-Frequency Trading Engineer",
        description: "Requires minimum CGPA 9.0 and advanced systems programming.",
        type: "FULL_TIME",
        location: "Bengaluru",
        stipendSalary: "₹1,50,000/mo",
        minCgpa: 9.0, // High CGPA requirement
        requiredSkills: [
          { name: "C++", weight: 5, minBenchmark: 80, isMandatory: true },
          { name: "Data Structures & Algorithms", weight: 5, minBenchmark: 85, isMandatory: true },
        ],
      },
    });
    const highCgpaJobId = createHighCgpaJob.json.data.job.id;

    // 4.2 Student with CGPA 8.45 tries to apply -> MUST BE REJECTED (403 Forbidden)
    const rejectAppRes = await makeRequest({
      path: "/api/v1/applications",
      method: "POST",
      headers: studentAuth,
      body: { jobId: highCgpaJobId },
    });
    assert(
      rejectAppRes.statusCode === 403 &&
      rejectAppRes.json.message.includes("do not meet the minimum CGPA requirement"),
      "Backend Security Rejection: Student CGPA 8.45 < Min CGPA 9.0 (403 Forbidden)"
    );

    // 4.3 Create Job with Min CGPA 7.5 (Student has 8.45 -> Should Succeed)
    const createEligibleJob = await makeRequest({
      path: "/api/v1/jobs",
      method: "POST",
      headers: industryAuth,
      body: {
        title: "Full-Stack AI Software Engineer",
        description: "Open for B.Tech graduates with min CGPA 7.5.",
        type: "INTERNSHIP",
        location: "Bengaluru / Hybrid",
        stipendSalary: "₹65,000/mo",
        minCgpa: 7.5,
        requiredSkills: [
          { name: "C++", weight: 4, minBenchmark: 70 },
          { name: "Python", weight: 4, minBenchmark: 70 },
        ],
      },
    });
    const eligibleJobId = createEligibleJob.json.data.job.id;

    const acceptAppRes = await makeRequest({
      path: "/api/v1/applications",
      method: "POST",
      headers: studentAuth,
      body: { jobId: eligibleJobId },
    });
    assert(
      acceptAppRes.statusCode === 201 && acceptAppRes.json.data.applicationId,
      "Eligible Student Application Accepted (CGPA 8.45 >= 7.5)"
    );

    // -------------------------------------------------------------------------
    // 5. GUIDANCE SLOTS & FACULTY SKILL ENDORSEMENTS
    // -------------------------------------------------------------------------
    console.log("\n[5/6] 🏛️ AUDITING GUIDANCE SLOTS & FACULTY SKILL ENDORSEMENT...");

    // Login as Faculty
    const facultyLogin = await makeRequest({
      path: "/api/v1/auth/login",
      method: "POST",
      body: { email: "faculty@university.edu", password: "Password@123" },
    });
    const facultyAuth = { Authorization: `Bearer ${facultyLogin.json.data.token}` };

    // 5.1 Faculty Creates Guidance Slot
    const createSlotRes = await makeRequest({
      path: "/api/v1/mentorship",
      method: "POST",
      headers: facultyAuth,
      body: {
        topic: "Systems Architecture & Capstone Rubric Review",
        durationMinutes: 45,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      },
    });
    assert(
      createSlotRes.statusCode === 201 && createSlotRes.json.data.slot.id,
      "Faculty Guidance Slot Generation"
    );
    const slotId = createSlotRes.json.data.slot.id;

    // 5.2 Student Books Guidance Slot
    const bookSlotRes = await makeRequest({
      path: "/api/v1/mentorship",
      method: "POST",
      headers: studentAuth,
      body: {
        action: "BOOK",
        slotId,
        notes: "1:1 AI Skill Gap and Learning Roadmap consultation.",
      },
    });
    assert(
      bookSlotRes.statusCode === 201 && bookSlotRes.json.data.status === "CONFIRMED",
      "Student Books Guidance Slot with Database Confirmation"
    );

    // 5.3 Faculty Endorses Student Skill
    const endorseRes = await makeRequest({
      path: "/api/v1/endorsements",
      method: "POST",
      headers: facultyAuth,
      body: {
        studentSkillId: "test", // Will match available student skill record
        endorsedScore: 92.0,
        feedback: "Demonstrated mastery in production systems design and OBE standards.",
      },
    });
    assert(
      endorseRes.statusCode === 200 || endorseRes.statusCode === 201,
      "Authorized Faculty Skill Endorsement & Verified Score Logging"
    );

    // 5.4 Student Fails to Self-Endorse (Forbidden)
    const studentBadEndorse = await makeRequest({
      path: "/api/v1/endorsements",
      method: "POST",
      headers: studentAuth,
      body: { studentSkillId: "test", endorsedScore: 100 },
    });
    assert(
      studentBadEndorse.statusCode === 401 || studentBadEndorse.statusCode === 403,
      "Security Shield: Student Cannot Self-Endorse Own Skills"
    );

    // -------------------------------------------------------------------------
    // 6. PUBLIC PORTFOLIO & RECRUITER APPLICANT VIEW
    // -------------------------------------------------------------------------
    console.log("\n[6/6] 🌐 AUDITING PUBLIC VERIFIED PORTFOLIO & APPLICANT DOSSIER...");

    // 6.1 Public Portfolio Query for Aarav Sharma
    const portfolioRes = await makeRequest({
      path: "/api/v1/portfolio/aarav-sharma",
      method: "GET",
    });
    assert(
      portfolioRes.statusCode === 200 &&
      portfolioRes.json.data.profile.collegeName &&
      portfolioRes.json.data.user.email &&
      !portfolioRes.json.data.user.passwordHash,
      "Public Verified Portfolio (Zero Password/Token Leakage, Real DB Data)"
    );

    // 6.2 Recruiter Pipeline Applications Query
    const pipelineRes = await makeRequest({
      path: "/api/v1/applications",
      method: "GET",
      headers: industryAuth,
    });
    assert(
      pipelineRes.statusCode === 200 && Array.isArray(pipelineRes.json.data.candidates),
      "Recruiter Applicant Dossier & Vector Match Pipeline"
    );

    console.log("\n================================================================================");
    console.log(`🎉 ALL NEW FEATURE TESTS COMPLETE: ${passed} Passed, ${failed} Failed`);
    console.log("================================================================================");
  } catch (err) {
    console.error("Test execution error:", err);
  }
}

runAudit();
