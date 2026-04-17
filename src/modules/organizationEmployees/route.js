import { models } from "../../../configs/server.config.js";
import successResponse from "../../../server/utils/responses/successResponse.js";

export default (router) => {
  /**
   * GET /api/organization-employees-with-info
   * Query: collegeId (required)
   * Returns employees joined with user name/email and role group name
   */
  router.get("/organization-employees-with-info", async (req, res, next) => {
    try {
      const { collegeId, limit = 200 } = req.query;

      if (!collegeId) {
        return res.status(400).json({
          success: false,
          message: "collegeId is required",
        });
      }

      const employees = await models.organizationEmployees.findAll({
        where: { collegeId },
        include: [
          {
            model: models.users,
            as: "user",
            attributes: ["id", "firstName", "lastName", "email", "phone"],
          },
          {
            model: models.collegeCustomRoleGroups,
            as: "roleGroup",
            attributes: ["id", "name"],
          },
          {
            model: models.modules,
            as: "associatedModule",
            attributes: ["id", "name"],
            required: false,
          },
        ],
        order: [["createdAt", "ASC"]],
        limit: Number(limit),
      });

      const result = employees.map((emp) => ({
        id: emp.id,
        userId: emp.userId,
        collegeId: emp.collegeId,
        collegeCustomRoleGroupId: emp.collegeCustomRoleGroupId,
        designation: emp.designation,
        entry: emp.entry,
        associatedModuleId: emp.associatedModuleId,
        isActive: emp.isActive,
        createdAt: emp.createdAt,
        name:
          `${emp.user?.firstName || ""} ${emp.user?.lastName || ""}`.trim() ||
          emp.userId,
        firstName: emp.user?.firstName || "",
        lastName: emp.user?.lastName || "",
        email: emp.user?.email || "",
        phone: emp.user?.phone || "",
        roleGroupName: emp.roleGroup?.name || "",
        moduleName: emp.associatedModule?.name || "",
      }));

      return successResponse(
        res,
        result,
        "Employees fetched successfully",
        "organization-employees-with-info",
      );
    } catch (err) {
      next(err);
    }
  });
};
