import { faker } from "@faker-js/faker";
import { models, ids } from "../../../configs/server.config.js";
import successResponse from "../../../server/utils/responses/successResponse.js";
import { hashPassword } from "../../../server/lib/bcrypt.js";

const PROGRAM_LEVELS = ["bachelor", "master", "diploma", "certificate", "phd"];
const EXAM_TYPES = ["midterm", "final", "quiz", "assignment", "practical"];
const REMARK_TYPES = [
  "academic",
  "behavioral",
  "attendance",
  "participation",
  "achievement",
];
const MODULE_EXAM_TYPES = ["written", "practical", "oral", "online"];
const GENDERS = ["male", "female", "other"];

const CHUNK_SIZE = 300;

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function uniqueSuffix() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default (router) => {
  /**
   * GET /api/load-dummy-data
   * Loads large amounts of fake data for the logged-in user's college.
   * Creates: 25 programs, 50 batches, 100 groups, 100 modules, 1000 students,
   * attendance records, 100 exams, examModules, moduleMarks, studentRemarks.
   */
  router.get("/load-dummy-data", async (req, res, next) => {
    try {
      const employee = await models.organizationEmployees.findOne({
        where: { userId: req.user.id },
      });

      if (!employee) {
        return res
          .status(400)
          .json({ success: false, message: "No college found for this user" });
      }

      const collegeId = employee.collegeId;
      const creatorId = req.user.id;
      const ip = req.ip;

      // Ensure student role exists
      const studentRoleId = ids.studentRoleId;
      const existingRole = await models.roles.findOne({
        where: { id: studentRoleId },
      });
      if (!existingRole) {
        await models.roles.create({
          id: studentRoleId,
          name: "student",
          slug: "student",
          description: "Student role",
          ip,
          isActive: true,
        });
      }

      // Pre-compute a single password hash to reuse for all dummy students
      const hashedPassword = await hashPassword("Student@123");

      // ── 1. Programs (25) ──────────────────────────────────────────────────
      const programData = Array.from({ length: 25 }, (_, i) => ({
        name: `${faker.commerce.department()} Studies ${i + 1}`,
        collegeId,
        code: `PRG${String(i + 1).padStart(3, "0")}`,
        description: faker.lorem.paragraph(),
        level: faker.helpers.arrayElement(PROGRAM_LEVELS),
        universityName: faker.company.name(),
        totalCredits: faker.number.int({ min: 60, max: 180 }),
        ip,
        createdBy: creatorId,
        updatedBy: creatorId,
        isActive: true,
      }));

      const programs = await models.programs.bulkCreate(programData, {
        returning: true,
      });

      // ── 2. Batches (2 per program = 50) ────────────────────────────────
      const batchData = [];
      programs.forEach((program) => {
        for (let i = 0; i < 2; i++) {
          const year = 2021 + i;
          batchData.push({
            name: `${program.name} - Batch ${year}`,
            programId: program.id,
            year,
            description: faker.lorem.sentence(),
            ip,
            createdBy: creatorId,
            updatedBy: creatorId,
            isActive: true,
          });
        }
      });

      const batches = await models.batches.bulkCreate(batchData, {
        returning: true,
      });

      // ── 3. Groups (2 per batch = 100) ──────────────────────────────────
      const groupData = [];
      batches.forEach((batch) => {
        ["A", "B"].forEach((letter) => {
          groupData.push({
            name: `Group ${letter} - ${batch.year}`,
            batchId: batch.id,
            year: batch.year,
            supervisorId: creatorId,
            description: faker.lorem.sentence(),
            ip,
            createdBy: creatorId,
            updatedBy: creatorId,
            isActive: true,
          });
        });
      });

      const groups = await models.groups.bulkCreate(groupData, {
        returning: true,
      });

      // ── 4. Modules (4 per program = 100) ────────────────────────────────
      const moduleData = [];
      programs.forEach((program, pi) => {
        for (let i = 0; i < 4; i++) {
          moduleData.push({
            name: `${faker.hacker.noun()} ${faker.hacker.verb()} ${pi * 4 + i + 1}`,
            programId: program.id,
            code: `MOD${String(pi * 4 + i + 1).padStart(3, "0")}`,
            description: faker.lorem.paragraph(),
            credits: faker.number.int({ min: 2, max: 6 }),
            ip,
            createdBy: creatorId,
            updatedBy: creatorId,
            isActive: true,
          });
        }
      });

      const modulesCreated = await models.modules.bulkCreate(moduleData, {
        returning: true,
      });

      // Build lookup: programId → modules[]
      const modulesByProgram = {};
      modulesCreated.forEach((mod) => {
        if (!modulesByProgram[mod.programId]) {
          modulesByProgram[mod.programId] = [];
        }
        modulesByProgram[mod.programId].push(mod);
      });

      // ── 5. Students (10 per group = 1000) ─────────────────────────────
      // Build lookup: batchId → programId
      const batchProgramMap = {};
      batches.forEach((b) => {
        batchProgramMap[b.id] = b.programId;
      });

      // Build lookup: groupId → programId
      const groupProgramMap = {};
      groups.forEach((g) => {
        groupProgramMap[g.id] = batchProgramMap[g.batchId];
      });

      const userData = [];
      const studentDetailData = [];

      let studentCounter = 0;
      for (const group of groups) {
        for (let i = 0; i < 10; i++) {
          studentCounter++;
          const firstName = faker.person.firstName();
          const lastName = faker.person.lastName();
          const email = `student${studentCounter}_${uniqueSuffix()}@dummy.edu`;

          userData.push({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone: `+1${faker.string.numeric(10)}`,
            gender: faker.helpers.arrayElement(GENDERS),
            address: faker.location.streetAddress(),
            roleId: studentRoleId,
            isTermsAndConditionsAccepted: true,
            isEmailVerified: true,
            ip,
            createdBy: creatorId,
            updatedBy: creatorId,
            isActive: true,
          });

          // store groupId in a separate parallel structure
          studentDetailData.push({
            groupId: group.id,
            dobAge: faker.number.int({ min: 18, max: 28 }),
          });
        }
      }

      const createdUsers = await models.users.bulkCreate(userData, {
        returning: true,
      });

      const studentDetailRecords = createdUsers.map((user, idx) => {
        const age = studentDetailData[idx].dobAge;
        const dob = new Date();
        dob.setFullYear(dob.getFullYear() - age);
        dob.setMonth(faker.number.int({ min: 0, max: 11 }));
        dob.setDate(faker.number.int({ min: 1, max: 28 }));

        return {
          userId: user.id,
          groupId: studentDetailData[idx].groupId,
          dob: dob.toISOString().split("T")[0],
          ip,
          createdBy: creatorId,
          updatedBy: creatorId,
          isActive: true,
        };
      });

      const createdStudents = await models.studentDetails.bulkCreate(
        studentDetailRecords,
        { returning: true },
      );

      // Build lookup: programId → studentDetails[]
      const studentsByProgram = {};
      createdStudents.forEach((sd, idx) => {
        const programId = groupProgramMap[sd.groupId];
        if (!studentsByProgram[programId]) studentsByProgram[programId] = [];
        studentsByProgram[programId].push(sd);
      });

      // ── 6. Attendance (unique dates per student) ────────────────────────
      const today = new Date();
      const attendanceData = [];

      for (const user of createdUsers) {
        const numDays = faker.number.int({ min: 60, max: 120 });
        const usedDates = new Set();

        let generated = 0;
        let attempts = 0;
        while (generated < numDays && attempts < numDays * 3) {
          attempts++;
          const daysAgo = faker.number.int({ min: 1, max: 400 });
          const d = new Date(today);
          d.setDate(d.getDate() - daysAgo);
          // Skip Sundays
          if (d.getDay() === 0) continue;
          const dateKey = d.toISOString().split("T")[0];
          if (usedDates.has(dateKey)) continue;
          usedDates.add(dateKey);
          generated++;

          attendanceData.push({
            userId: user.id,
            dateTime: new Date(`${dateKey}T08:00:00.000Z`),
            ip,
            createdBy: creatorId,
            updatedBy: creatorId,
            isActive: true,
          });
        }
      }

      for (const chunk of chunkArray(attendanceData, CHUNK_SIZE)) {
        await models.attendances.bulkCreate(chunk, { returning: false });
      }

      // ── 7. Exams (4 per program = 100) ──────────────────────────────────
      const examData = [];
      programs.forEach((program, pi) => {
        EXAM_TYPES.slice(0, 4).forEach((type, ei) => {
          examData.push({
            name: `${type.charAt(0).toUpperCase() + type.slice(1)} Exam - ${program.name.slice(0, 20)}`,
            type,
            description: faker.lorem.sentence(),
            programId: program.id,
            ip,
            createdBy: creatorId,
            updatedBy: creatorId,
            isActive: true,
          });
        });
      });

      const exams = await models.exams.bulkCreate(examData, {
        returning: true,
      });

      // Build lookup: programId → exams[]
      const examsByProgram = {};
      exams.forEach((exam) => {
        if (!examsByProgram[exam.programId]) examsByProgram[exam.programId] = [];
        examsByProgram[exam.programId].push(exam);
      });

      // ── 8. Exam Modules (2-3 per exam) ──────────────────────────────────
      const examModuleData = [];
      exams.forEach((exam) => {
        const programMods = modulesByProgram[exam.programId] || [];
        if (!programMods.length) return;
        const shuffled = [...programMods].sort(() => Math.random() - 0.5);
        const count = Math.min(
          faker.number.int({ min: 2, max: 3 }),
          shuffled.length,
        );

        for (let i = 0; i < count; i++) {
          examModuleData.push({
            examId: exam.id,
            moduleId: shuffled[i].id,
            examType: faker.helpers.arrayElement(MODULE_EXAM_TYPES),
            totalMarks: faker.helpers.arrayElement([25, 50, 75, 100]),
            ip,
            createdBy: creatorId,
            updatedBy: creatorId,
            isActive: true,
          });
        }
      });

      const examModules = await models.examModules.bulkCreate(examModuleData, {
        returning: true,
      });

      // Build lookup: examId → examModules[]
      const examModulesByExam = {};
      examModules.forEach((em) => {
        if (!examModulesByExam[em.examId]) examModulesByExam[em.examId] = [];
        examModulesByExam[em.examId].push(em);
      });

      // ── 9. Module Marks (~90% students per program per exam module) ──────
      const moduleMarksData = [];
      programs.forEach((program) => {
        const programStudents = studentsByProgram[program.id] || [];
        const programExams = examsByProgram[program.id] || [];

        programExams.forEach((exam) => {
          const ems = examModulesByExam[exam.id] || [];
          ems.forEach((em) => {
            programStudents.forEach((student) => {
              if (Math.random() < 0.9) {
                moduleMarksData.push({
                  examModuleId: em.id,
                  studentId: student.id,
                  obtainedMarks: parseFloat(
                    faker.number
                      .float({
                        min: 0,
                        max: Number(em.totalMarks),
                        fractionDigits: 1,
                      })
                      .toFixed(1),
                  ),
                  ip,
                  createdBy: creatorId,
                  updatedBy: creatorId,
                  isActive: true,
                });
              }
            });
          });
        });
      });

      for (const chunk of chunkArray(moduleMarksData, CHUNK_SIZE)) {
        await models.moduleMarks.bulkCreate(chunk, { returning: false });
      }

      // ── 10. Student Remarks (3-5 per student) ────────────────────────────
      const remarksData = [];
      createdStudents.forEach((student) => {
        const count = faker.number.int({ min: 3, max: 5 });
        for (let i = 0; i < count; i++) {
          remarksData.push({
            studentId: student.id,
            teacherId: creatorId,
            remarkType: faker.helpers.arrayElement(REMARK_TYPES),
            subject: faker.lorem.words(faker.number.int({ min: 3, max: 6 })),
            message: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
            ip,
            createdBy: creatorId,
            updatedBy: creatorId,
            isActive: true,
          });
        }
      });

      for (const chunk of chunkArray(remarksData, CHUNK_SIZE)) {
        await models.studentRemarks.bulkCreate(chunk, { returning: false });
      }

      return successResponse(
        res,
        {
          programs: programs.length,
          batches: batches.length,
          groups: groups.length,
          modules: modulesCreated.length,
          students: createdStudents.length,
          attendanceRecords: attendanceData.length,
          exams: exams.length,
          examModules: examModules.length,
          moduleMarks: moduleMarksData.length,
          studentRemarks: remarksData.length,
        },
        "Dummy data loaded successfully!",
        "load-dummy-data",
      );
    } catch (err) {
      next(err);
    }
  });
};
