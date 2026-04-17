import { Op } from "sequelize";
import { models } from "../../../configs/server.config.js";
import successResponse from "../../../server/utils/responses/successResponse.js";

export default (router) => {
  /**
   * GET /api/attendance-by-group
   * Query params: groupId (required), date (YYYY-MM-DD, required)
   *
   * Returns every student in the group with their present/absent status
   * for the given calendar date, plus the attendanceId if present.
   */
  router.get("/attendance-by-group", async (req, res, next) => {
    try {
      const { groupId, date } = req.query;

      if (!groupId) {
        return res
          .status(400)
          .json({ success: false, message: "groupId is required" });
      }
      if (!date) {
        return res
          .status(400)
          .json({ success: false, message: "date is required" });
      }

      // Build the day window in UTC
      const dayStart = new Date(`${date}T00:00:00.000Z`);
      const dayEnd = new Date(`${date}T23:59:59.999Z`);

      // 1. Fetch all student-details for the group, joining with users for names
      const studentDetails = await models.studentDetails.findAll({
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

      if (!studentDetails.length) {
        return successResponse(
          res,
          [],
          "No students found for this group",
          "attendance-by-group",
        );
      }

      // 2. Collect all userIds
      const userIds = studentDetails.map((sd) => sd.userId);

      // 3. Fetch all attendance records for those users on the given date
      const attendances = await models.attendances.findAll({
        where: {
          userId: { [Op.in]: userIds },
          dateTime: { [Op.between]: [dayStart, dayEnd] },
        },
      });

      // Build a map: userId → attendance record
      const attendanceMap = {};
      attendances.forEach((att) => {
        attendanceMap[att.userId] = att;
      });

      // 4. Build response
      const result = studentDetails.map((sd) => {
        const att = attendanceMap[sd.userId] || null;
        return {
          studentDetailId: sd.id,
          userId: sd.userId,
          firstName: sd.user?.firstName || "",
          lastName: sd.user?.lastName || "",
          email: sd.user?.email || "",
          isPresent: !!att,
          attendanceId: att?.id || null,
        };
      });

      successResponse(
        res,
        result,
        "Attendance fetched successfully",
        "attendance-by-group",
      );
    } catch (err) {
      next(err);
    }
  });
};
