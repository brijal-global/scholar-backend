import { Op } from "sequelize";
import { models } from "../../../configs/server.config.js";
import successResponse from "../../../server/utils/responses/successResponse.js";

// ─── TensorFlow Linear Regression Helper ───────────────────────────────────
let tf = null;
async function getTF() {
  if (!tf) {
    tf = await import("@tensorflow/tfjs");
    // Prefer CPU backend in Node.js
    await tf.setBackend("cpu");
    await tf.ready();
  }
  return tf;
}

/**
 * Simple linear regression using TF.
 * Returns { slope, intercept, nextPrediction }
 */
async function tfLinearRegression(xArr, yArr) {
  if (!xArr || xArr.length < 2) return { slope: 0, intercept: 0, r2: 0 };
  try {
    const TF = await getTF();
    const xs = TF.tensor1d(xArr.map(Number));
    const ys = TF.tensor1d(yArr.map(Number));

    // Normalise x to [0,1] for stability
    const xMin = xs.min();
    const xMax = xs.max();
    const xRange = xMax.sub(xMin);
    const xNorm = xRange.equal(0).any().dataSync()[0]
      ? xs
      : xs.sub(xMin).div(xRange);

    const model = TF.sequential();
    model.add(
      TF.layers.dense({ units: 1, inputShape: [1], useBias: true }),
    );
    model.compile({
      optimizer: TF.train.adam(0.05),
      loss: "meanSquaredError",
    });

    await model.fit(xNorm.reshape([-1, 1]), ys, {
      epochs: 200,
      verbose: 0,
    });

    // Compute slope in original scale
    const weights = model.getWeights();
    const w = weights[0].dataSync()[0];
    const b = weights[1].dataSync()[0];
    const xRangeVal = xRange.dataSync()[0] || 1;
    const slope = w / xRangeVal;
    const xMinVal = xMin.dataSync()[0];
    const intercept = b - w * (xMinVal / xRangeVal);

    // Predict next value
    const nextX = (xArr[xArr.length - 1] + 1 - xMinVal) / xRangeVal;
    const nextNorm = TF.tensor2d([[nextX]]);
    const predTensor = model.predict(nextNorm);
    const nextPrediction = Math.max(0, predTensor.dataSync()[0]);

    // R² (coefficient of determination)
    const yMean = ys.mean().dataSync()[0];
    const ssTot = ys.sub(yMean).square().sum().dataSync()[0];
    const yPred = model.predict(xNorm.reshape([-1, 1]));
    const ssRes = ys.sub(yPred).square().sum().dataSync()[0];
    const r2 = ssTot === 0 ? 1 : Math.max(0, 1 - ssRes / ssTot);

    // cleanup
    [xs, ys, xMin, xMax, xRange, xNorm, nextNorm, predTensor, yPred].forEach(
      (t) => t.dispose && t.dispose(),
    );
    model.dispose();

    return { slope: Number(slope.toFixed(4)), intercept: Number(intercept.toFixed(4)), r2: Number(r2.toFixed(4)), nextPrediction: Number(nextPrediction.toFixed(2)) };
  } catch {
    return { slope: 0, intercept: 0, r2: 0, nextPrediction: 0 };
  }
}

function trend(slope) {
  if (slope > 0.3) return "improving";
  if (slope < -0.3) return "declining";
  return "stable";
}

function gradeFromPercent(pct) {
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

function riskLevel(attendancePct, avgScorePct) {
  const score = attendancePct * 0.4 + avgScorePct * 0.6;
  if (score >= 65) return "low";
  if (score >= 45) return "medium";
  return "high";
}

export default (router) => {
  /**
   * GET /api/student-analytics/:studentDetailId
   * Returns comprehensive analytics for a student using TensorFlow regression.
   */
  router.get("/student-analytics/:studentDetailId", async (req, res, next) => {
    try {
      const { studentDetailId } = req.params;

      // ── Student & User Info ─────────────────────────────────────────────
      const studentDetail = await models.studentDetails.findOne({
        where: { id: studentDetailId },
        include: [
          {
            model: models.users,
            as: "user",
            attributes: [
              "id",
              "firstName",
              "lastName",
              "email",
              "phone",
              "gender",
              "address",
              "profileImage",
            ],
          },
          {
            model: models.groups,
            as: "group",
            include: [
              {
                model: models.batches,
                as: "batch",
                include: [
                  {
                    model: models.programs,
                    as: "program",
                    attributes: ["id", "name", "level", "code"],
                  },
                ],
                attributes: ["id", "name", "year"],
              },
            ],
            attributes: ["id", "name", "year"],
          },
        ],
      });

      if (!studentDetail) {
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });
      }

      const userId = studentDetail.userId;
      const programId = studentDetail.group?.batch?.programId;

      // ── Attendance Analytics ────────────────────────────────────────────
      const attendances = await models.attendances.findAll({
        where: { userId },
        attributes: ["id", "dateTime"],
        order: [["dateTime", "ASC"]],
      });

      // Monthly breakdown: { "YYYY-MM": { present, total } }
      const monthlyMap = {};
      attendances.forEach((a) => {
        const d = new Date(a.dateTime);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!monthlyMap[key]) monthlyMap[key] = { present: 0, total: 0 };
        monthlyMap[key].present++;
      });

      // Estimate total working days per month (excluding Sundays ≈ 26 days)
      const allMonthKeys = Object.keys(monthlyMap).sort();
      allMonthKeys.forEach((k) => {
        monthlyMap[k].total = 26; // approximate
      });

      const monthlyBreakdown = allMonthKeys.map((k, i) => ({
        month: k,
        present: monthlyMap[k].present,
        total: monthlyMap[k].total,
        rate: Math.min(
          100,
          Math.round((monthlyMap[k].present / monthlyMap[k].total) * 100),
        ),
        index: i,
      }));

      const totalPresent = attendances.length;
      const totalWorkingDays = monthlyBreakdown.length * 26;
      const attendanceRate =
        totalWorkingDays > 0
          ? Math.min(100, Math.round((totalPresent / totalWorkingDays) * 100))
          : 0;

      // TF regression on monthly attendance rates
      const attXs = monthlyBreakdown.map((m) => m.index);
      const attYs = monthlyBreakdown.map((m) => m.rate);
      const attRegression = await tfLinearRegression(attXs, attYs);

      // Streak calculation
      const presentSet = new Set(
        attendances.map((a) => new Date(a.dateTime).toISOString().split("T")[0]),
      );
      const sortedDates = [...presentSet].sort();
      let currentStreak = 0;
      let maxStreak = 0;
      let streakCount = 0;
      sortedDates.forEach((d, i) => {
        if (i === 0) {
          streakCount = 1;
        } else {
          const prev = new Date(sortedDates[i - 1]);
          const curr = new Date(d);
          const diff = (curr - prev) / (1000 * 60 * 60 * 24);
          streakCount = diff === 1 ? streakCount + 1 : 1;
        }
        if (streakCount > maxStreak) maxStreak = streakCount;
      });
      const lastDate = sortedDates[sortedDates.length - 1];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastDate === yesterday.toISOString().split("T")[0]) {
        currentStreak = streakCount;
      }

      // ── Exam Results Analytics ──────────────────────────────────────────
      let examResultsData = [];
      let allModuleMarks = [];

      if (programId) {
        // Get all exams for this program
        const programExams = await models.exams.findAll({
          where: { programId },
          attributes: ["id", "name", "type", "createdAt"],
          order: [["createdAt", "ASC"]],
        });

        const examIds = programExams.map((e) => e.id);
        const examMap = {};
        programExams.forEach((e) => {
          examMap[e.id] = e;
        });

        if (examIds.length) {
          // Get exam modules for these exams
          const examModules = await models.examModules.findAll({
            where: { examId: { [Op.in]: examIds } },
            include: [
              {
                model: models.modules,
                as: "module",
                attributes: ["id", "name", "code"],
              },
            ],
            attributes: ["id", "examId", "moduleId", "examType", "totalMarks"],
          });

          const emIds = examModules.map((em) => em.id);
          const emMap = {};
          examModules.forEach((em) => {
            emMap[em.id] = em;
          });

          // Get marks for this student
          if (emIds.length) {
            allModuleMarks = await models.moduleMarks.findAll({
              where: {
                examModuleId: { [Op.in]: emIds },
                studentId: studentDetailId,
              },
              attributes: ["id", "examModuleId", "obtainedMarks", "remarks"],
            });

            const markMap = {};
            allModuleMarks.forEach((m) => {
              markMap[m.examModuleId] = m;
            });

            // Build per-exam result
            const examModulesByExamId = {};
            examModules.forEach((em) => {
              if (!examModulesByExamId[em.examId])
                examModulesByExamId[em.examId] = [];
              examModulesByExamId[em.examId].push(em);
            });

            examResultsData = programExams
              .map((exam, i) => {
                const ems = examModulesByExamId[exam.id] || [];
                const obtained = ems.reduce((sum, em) => {
                  return sum + (markMap[em.id]?.obtainedMarks || 0);
                }, 0);
                const total = ems.reduce(
                  (sum, em) => sum + Number(em.totalMarks),
                  0,
                );
                const pct = total > 0 ? (obtained / total) * 100 : null;
                return {
                  examId: exam.id,
                  examName: exam.name,
                  examType: exam.type,
                  date: exam.createdAt,
                  modules: ems.map((em) => ({
                    examModuleId: em.id,
                    moduleName: em.module?.name || "Unknown",
                    moduleCode: em.module?.code || "",
                    examType: em.examType,
                    totalMarks: Number(em.totalMarks),
                    obtainedMarks: markMap[em.id]?.obtainedMarks ?? null,
                    remarks: markMap[em.id]?.remarks || "",
                  })),
                  obtainedTotal: Number(obtained.toFixed(2)),
                  maxTotal: total,
                  percentage: pct !== null ? Number(pct.toFixed(2)) : null,
                  grade: pct !== null ? gradeFromPercent(pct) : "N/A",
                  index: i,
                };
              })
              .filter((e) => e.maxTotal > 0);
          }
        }
      }

      // TF regression on exam percentage trend
      const scoredExams = examResultsData.filter(
        (e) => e.percentage !== null,
      );
      const examXs = scoredExams.map((e) => e.index);
      const examYs = scoredExams.map((e) => e.percentage);
      const examRegression = await tfLinearRegression(examXs, examYs);

      const avgExamScore =
        examYs.length > 0
          ? Number((examYs.reduce((a, b) => a + b, 0) / examYs.length).toFixed(2))
          : 0;

      // Per-module averages
      const moduleScores = {};
      examResultsData.forEach((exam) => {
        exam.modules.forEach((mod) => {
          if (mod.obtainedMarks !== null) {
            if (!moduleScores[mod.moduleName])
              moduleScores[mod.moduleName] = { obtained: 0, total: 0, count: 0 };
            moduleScores[mod.moduleName].obtained += mod.obtainedMarks;
            moduleScores[mod.moduleName].total += mod.totalMarks;
            moduleScores[mod.moduleName].count++;
          }
        });
      });

      const modulePerformance = Object.entries(moduleScores).map(
        ([name, s]) => ({
          moduleName: name,
          avgScore: Number((s.obtained / s.count).toFixed(2)),
          avgTotal: Number((s.total / s.count).toFixed(2)),
          pct: Number(((s.obtained / s.total) * 100).toFixed(2)),
          attempts: s.count,
        }),
      );

      const bestModule = modulePerformance.sort((a, b) => b.pct - a.pct)[0];
      const worstModule = modulePerformance.sort((a, b) => a.pct - b.pct)[0];

      // ── Remarks Analytics ───────────────────────────────────────────────
      const remarks = await models.studentRemarks.findAll({
        where: { studentId: studentDetailId },
        include: [
          {
            model: models.users,
            as: "teacher",
            attributes: ["id", "firstName", "lastName"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 200,
      });

      const remarksByType = {};
      remarks.forEach((r) => {
        if (!remarksByType[r.remarkType]) remarksByType[r.remarkType] = 0;
        remarksByType[r.remarkType]++;
      });

      const recentRemarks = remarks.slice(0, 10).map((r) => ({
        id: r.id,
        type: r.remarkType,
        subject: r.subject,
        message: r.message,
        teacherName: r.teacher
          ? `${r.teacher.firstName} ${r.teacher.lastName}`.trim()
          : "Unknown",
        date: r.createdAt,
      }));

      // Positive types for a simple sentiment split
      const positiveTypes = new Set(["achievement", "participation"]);
      const negativeTypes = new Set(["behavioral", "attendance"]);
      let positiveCount = 0;
      let negativeCount = 0;
      let neutralCount = 0;
      remarks.forEach((r) => {
        if (positiveTypes.has(r.remarkType)) positiveCount++;
        else if (negativeTypes.has(r.remarkType)) negativeCount++;
        else neutralCount++;
      });

      // ── Overall Performance Score ───────────────────────────────────────
      // Weighted: 40% attendance, 50% exam avg, 10% positive remarks ratio
      const positiveRatio =
        remarks.length > 0
          ? (positiveCount / remarks.length) * 100
          : 50;
      const overallScore = Number(
        (
          attendanceRate * 0.4 +
          avgExamScore * 0.5 +
          positiveRatio * 0.1
        ).toFixed(2),
      );

      const risk = riskLevel(attendanceRate, avgExamScore);

      const insights = [];
      if (attendanceRate < 75)
        insights.push("Attendance is below the 75% minimum threshold.");
      if (avgExamScore < 50)
        insights.push("Exam scores are critically low — immediate support needed.");
      if (attRegression.slope < -1)
        insights.push("Attendance is showing a declining trend.");
      if (examRegression.slope > 1)
        insights.push("Exam performance is improving — keep up the momentum!");
      if (negativeCount > positiveCount && remarks.length > 3)
        insights.push("Behavioral/attendance remarks outnumber positive ones.");
      if (currentStreak > 7)
        insights.push(`Excellent! Currently on a ${currentStreak}-day attendance streak.`);
      if (insights.length === 0)
        insights.push("Overall performance is on track. Continue the good work!");

      // ── Predicted Next Month Attendance ─────────────────────────────────
      const predictedNextMonthAttendance = Math.min(
        100,
        Math.max(0, Math.round(attRegression.nextPrediction || attendanceRate)),
      );

      const payload = {
        student: {
          id: studentDetail.id,
          userId,
          firstName: studentDetail.user?.firstName,
          lastName: studentDetail.user?.lastName,
          fullName: `${studentDetail.user?.firstName || ""} ${studentDetail.user?.lastName || ""}`.trim(),
          email: studentDetail.user?.email,
          phone: studentDetail.user?.phone,
          gender: studentDetail.user?.gender,
          address: studentDetail.user?.address,
          profileImage: studentDetail.user?.profileImage,
          dob: studentDetail.dob,
          enrolledAt: studentDetail.createdAt,
          group: {
            id: studentDetail.group?.id,
            name: studentDetail.group?.name,
            year: studentDetail.group?.year,
          },
          batch: {
            id: studentDetail.group?.batch?.id,
            name: studentDetail.group?.batch?.name,
            year: studentDetail.group?.batch?.year,
          },
          program: {
            id: studentDetail.group?.batch?.program?.id,
            name: studentDetail.group?.batch?.program?.name,
            level: studentDetail.group?.batch?.program?.level,
            code: studentDetail.group?.batch?.program?.code,
          },
        },
        attendance: {
          totalPresent,
          totalWorkingDays,
          attendanceRate,
          monthlyBreakdown,
          trend: trend(attRegression.slope),
          regression: {
            slope: attRegression.slope,
            r2: attRegression.r2,
          },
          predictedNextMonth: predictedNextMonthAttendance,
          currentStreak,
          maxStreak,
        },
        examResults: {
          exams: examResultsData,
          totalExams: examResultsData.length,
          attemptedExams: scoredExams.length,
          avgScore: avgExamScore,
          overallGrade: gradeFromPercent(avgExamScore),
          trend: trend(examRegression.slope),
          regression: {
            slope: examRegression.slope,
            r2: examRegression.r2,
          },
          predictedNextScore: Math.min(
            100,
            Math.max(0, Math.round(examRegression.nextPrediction || avgExamScore)),
          ),
          modulePerformance,
          bestModule: bestModule || null,
          worstModule: worstModule || null,
        },
        remarks: {
          total: remarks.length,
          byType: remarksByType,
          positiveCount,
          negativeCount,
          neutralCount,
          sentimentRatio: {
            positive: positiveCount,
            negative: negativeCount,
            neutral: neutralCount,
          },
          recent: recentRemarks,
        },
        overallPerformance: {
          score: overallScore,
          grade: gradeFromPercent(overallScore),
          risk,
          insights,
          weights: { attendance: 40, examScores: 50, remarks: 10 },
          mlAnalysis: {
            attendanceTrend: trend(attRegression.slope),
            examTrend: trend(examRegression.slope),
            attendanceR2: attRegression.r2,
            examR2: examRegression.r2,
          },
        },
      };

      return successResponse(
        res,
        payload,
        "Student analytics fetched successfully",
        "student-analytics",
      );
    } catch (err) {
      next(err);
    }
  });
};
