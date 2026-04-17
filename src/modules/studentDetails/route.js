import { Op } from "sequelize";
import { hashPassword } from "../../../server/lib/bcrypt.js";
import successResponse from "../../../server/utils/responses/successResponse.js";
import {
  ConflictException,
  HttpException,
} from "../../../server/exceptions/index.js";
import { models, ids } from "../../../configs/server.config.js";

const { users, roles, studentDetails } = models;

export default (router) => {
  /**
   * GET /api/students-with-info
   * Query: groupId (single) OR groupIds[] (multiple), page, limit
   * Returns paginated studentDetails joined with user info (name, email, etc.)
   */
  router.get("/students-with-info", async (req, res, next) => {
    try {
      const { groupId } = req.query;
      let groupIds = req.query.groupIds || [];
      if (typeof groupIds === "string") groupIds = [groupIds];

      const idList = groupId ? [groupId] : groupIds;
      if (!idList.length) {
        return res
          .status(400)
          .json({ success: false, message: "groupId or groupIds is required" });
      }

      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.min(
        500,
        Math.max(1, parseInt(req.query.limit, 10) || 20),
      );
      const offset = (page - 1) * limit;

      const whereClause =
        idList.length === 1
          ? { groupId: idList[0] }
          : { groupId: { [Op.in]: idList } };

      const { count, rows } = await models.studentDetails.findAndCountAll({
        where: whereClause,
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
            ],
          },
        ],
        order: [["createdAt", "ASC"]],
        limit,
        offset,
      });

      const totalPages = Math.ceil(count / limit);

      const result = rows.map((sd) => ({
        id: sd.id,
        userId: sd.userId,
        groupId: sd.groupId,
        dob: sd.dob,
        isActive: sd.isActive,
        createdAt: sd.createdAt,
        name:
          `${sd.user?.firstName || ""} ${sd.user?.lastName || ""}`.trim() ||
          sd.userId,
        firstName: sd.user?.firstName || "",
        lastName: sd.user?.lastName || "",
        email: sd.user?.email || "",
        phone: sd.user?.phone || "",
        gender: sd.user?.gender || "",
        address: sd.user?.address || "",
      }));

      return successResponse(
        res,
        {
          rows: result,
          pagination: {
            totalCount: count,
            totalPages,
            currentPage: page,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        },
        "Students fetched successfully",
        "students-with-info",
      );
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/results-by-group
   * Query: examId (required), groupId (required)
   * Returns exam modules + student marks for the group in a cross-table format
   */
  router.get("/results-by-group", async (req, res, next) => {
    try {
      const { examId, groupId } = req.query;
      if (!examId || !groupId) {
        return res.status(400).json({
          success: false,
          message: "examId and groupId are required",
        });
      }

      // 1. Fetch exam modules for this exam (with module names)
      const examModules = await models.examModules.findAll({
        where: { examId },
        include: [
          {
            model: models.modules,
            as: "module",
            attributes: ["id", "name", "code"],
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      // 2. Fetch students in the group
      const studentRecords = await models.studentDetails.findAll({
        where: { groupId },
        include: [
          {
            model: models.users,
            as: "user",
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      const examModulesSummary = examModules.map((em) => ({
        id: em.id,
        examId: em.examId,
        moduleId: em.moduleId,
        moduleName: em.module?.name || em.moduleId,
        moduleCode: em.module?.code || "",
        examType: em.examType,
        totalMarks: em.totalMarks,
      }));

      // If no students, return real examModules with empty students array
      if (!studentRecords.length) {
        return successResponse(
          res,
          { examModules: examModulesSummary, students: [] },
          "Results fetched",
          "results-by-group",
        );
      }

      const examModuleIds = examModules.map((em) => em.id);
      const studentDetailIds = studentRecords.map((sd) => sd.id);

      // 3. Fetch all marks for these students and exam modules
      const allMarks = await models.moduleMarks.findAll({
        where: {
          examModuleId: { [Op.in]: examModuleIds },
          studentId: { [Op.in]: studentDetailIds },
        },
      });

      // Build marks lookup: studentId → examModuleId → mark record
      const marksMap = {};
      allMarks.forEach((m) => {
        if (!marksMap[m.studentId]) marksMap[m.studentId] = {};
        marksMap[m.studentId][m.examModuleId] = {
          id: m.id,
          obtainedMarks: m.obtainedMarks,
          remarks: m.remarks,
        };
      });

      const students = studentRecords.map((sd) => ({
        studentDetailId: sd.id,
        userId: sd.userId,
        name:
          `${sd.user?.firstName || ""} ${sd.user?.lastName || ""}`.trim() ||
          sd.userId,
        firstName: sd.user?.firstName || "",
        lastName: sd.user?.lastName || "",
        email: sd.user?.email || "",
        marks: marksMap[sd.id] || {},
      }));

      return successResponse(
        res,
        { examModules: examModulesSummary, students },
        "Results fetched successfully",
        "results-by-group",
      );
    } catch (err) {
      next(err);
    }
  });

  router.route("/register-student").post(async (req, res, next) => {
    try {
      const {
        firstName,
        lastName,
        email,
        password,
        phone,
        gender,
        address,
        groupId,
        dob,
      } = req.body;

      if (!firstName || !lastName || !email || !password) {
        throw new HttpException(
          400,
          "First name, last name, email, and password are required!",
          "register-student",
        );
      }

      if (!groupId || !dob) {
        throw new HttpException(
          400,
          "Group and date of birth are required!",
          "register-student",
        );
      }

      const existingUser = await users.findOne({
        where: { email },
        raw: true,
      });

      if (existingUser) {
        throw new ConflictException(
          "A user with this email already exists!",
          "register-student",
        );
      }

      const studentRoleId = ids.studentRoleId;

      const studentRole = await roles.findOne({
        where: { id: studentRoleId },
        raw: true,
      });

      if (!studentRole) {
        await roles.create({
          id: studentRoleId,
          name: "student",
          slug: "student",
          description: "Student role",
          ip: req.ip,
          isActive: true,
        });
      }

      const hashedPassword = await hashPassword(password);

      const createdUser = await users.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone: phone || null,
        gender: gender || "other",
        address: address || "",
        roleId: studentRoleId,
        isTermsAndConditionsAccepted: true,
        isEmailVerified: false,
        ip: req.ip,
        createdBy: req?.user?.id || null,
        updatedBy: req?.user?.id || null,
      });

      const createdStudentDetails = await studentDetails.create({
        userId: createdUser.id,
        groupId,
        dob,
        ip: req.ip,
        createdBy: req?.user?.id || null,
        updatedBy: req?.user?.id || null,
      });

      return successResponse(
        res,
        {
          user: {
            id: createdUser.id,
            firstName: createdUser.firstName,
            lastName: createdUser.lastName,
            email: createdUser.email,
          },
          studentDetails: createdStudentDetails,
        },
        "Student registered successfully!",
        "register-student",
      );
    } catch (error) {
      next(error);
    }
  });
};
