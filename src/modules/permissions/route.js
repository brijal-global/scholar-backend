import { models } from "../../../configs/server.config.js";
import successResponse from "../../../server/utils/responses/successResponse.js";

/* ────────────────────────────────────────────────────────────
   System planModules that should exist in the DB.
   Used in the seeder and in my-permissions for Admins.
──────────────────────────────────────────────────────────── */
const SYSTEM_MODULES = [
  { code: "programs", name: "Programs", desc: "Academic programs management" },
  { code: "batches", name: "Batches", desc: "Batch / intake management" },
  { code: "groups", name: "Groups", desc: "Student groups management" },
  {
    code: "courses",
    name: "Modules (Subjects)",
    desc: "Course & module catalog",
  },
  { code: "students", name: "Students", desc: "Student records" },
  { code: "attendance", name: "Attendance", desc: "Attendance tracking" },
  { code: "exams", name: "Exams", desc: "Exam management & marks entry" },
  { code: "results", name: "Results", desc: "Exam result sheets" },
  { code: "remarks", name: "Remarks", desc: "Student remarks / notes" },
  { code: "employees", name: "Employees", desc: "Staff & employee records" },
  {
    code: "roles",
    name: "Role Groups",
    desc: "Custom role & permission groups",
  },
  {
    code: "college-profile",
    name: "College Profile",
    desc: "College settings",
  },
];

/**
 * Ensure all system plan modules exist in DB (idempotent).
 */
export async function seedPlanModules(ip) {
  for (const mod of SYSTEM_MODULES) {
    await models.planModules.findOrCreate({
      where: { code: mod.code },
      defaults: {
        name: mod.name,
        description: mod.desc,
        ip: ip,
        isSystemModule: true,
        isActive: true,
      },
    });
  }
}

export default (router) => {
  /**
   * POST /api/load-default-modules
   * Scholar-admin endpoint: idempotently seeds all system planModules so that
   * college admins can configure per-role permissions in the /org portal.
   * Accessible only to superAdmin (unrestricted by the permission middleware).
   */
  router.get("/load-default-modules", async (req, res, next) => {
    try {
      await seedPlanModules(req.ip);
      const modules = await models.planModules.findAll({
        where: { isSystemModule: true, isActive: true },
        attributes: [
          "id",
          "code",
          "name",
          "description",
          "isSystemModule",
          "isActive",
        ],
        order: [["name", "ASC"]],
      });
      return successResponse(
        res,
        modules,
        `${modules.length} default module(s) loaded successfully`,
        "load-default-modules",
      );
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/plan-modules
   * Returns all system planModules.
   */
  router.get("/plan-modules", async (req, res, next) => {
    try {
      const modules = await models.planModules.findAll({
        where: { isSystemModule: true, isActive: true },
        order: [["name", "ASC"]],
      });
      return successResponse(
        res,
        modules,
        "Plan modules fetched",
        "plan-modules",
      );
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/my-permissions
   * Returns the logged-in org employee's permissions map:
   * { [moduleCode]: { canView, canCreate, canEdit, canDelete } }
   *
   * For admin role groups (isAdmin=true), returns full access for all modules.
   */
  router.get("/my-permissions", async (req, res, next) => {
    try {
      const user = req.user;

      // Find the employee record for this user
      const employee = await models.organizationEmployees.findOne({
        where: { userId: user.id },
        include: [
          {
            model: models.collegeCustomRoleGroups,
            as: "roleGroup",
            attributes: ["id", "name", "isAdmin"],
          },
        ],
      });

      if (!employee) {
        // If not an employee (e.g., college owner), check if they have a college
        // const college = await models.colleges.findOne({
        //   where: { ownerId: user.id },
        // });

        const college = null;

        if (college) {
          // Owner has full admin access — return all module permissions as true
          const allModules = await models.planModules.findAll({
            where: { isSystemModule: true, isActive: true },
          });
          const permissions = {};
          allModules.forEach((m) => {
            permissions[m.code] = {
              canView: true,
              canCreate: true,
              canEdit: true,
              canDelete: true,
            };
          });
          return successResponse(
            res,
            { permissions, isAdmin: true },
            "Permissions fetched",
            "my-permissions",
          );
        }
        return successResponse(
          res,
          { permissions: {}, isAdmin: false },
          "No permissions",
          "my-permissions",
        );
      }

      // Check if admin role group
      if (employee.roleGroup?.isAdmin) {
        const allModules = await models.planModules.findAll({
          where: { isSystemModule: true, isActive: true },
        });
        const permissions = {};
        allModules.forEach((m) => {
          permissions[m.code] = {
            canView: true,
            canCreate: true,
            canEdit: true,
            canDelete: true,
          };
        });
        return successResponse(
          res,
          { permissions, isAdmin: true },
          "Permissions fetched",
          "my-permissions",
        );
      }

      // Non-admin: fetch from collegeCustomRolePermissions
      const rolePerms = await models.collegeCustomRolePermissions.findAll({
        where: { collegeCustomRoleGroupId: employee.collegeCustomRoleGroupId },
        include: [
          {
            model: models.planModules,
            as: "planModule",
            attributes: ["id", "code", "name"],
          },
        ],
      });

      const permissions = {};
      rolePerms.forEach((rp) => {
        const code = rp.planModule?.code;
        if (code) {
          permissions[code] = {
            canView: rp.canView,
            canCreate: rp.canCreate,
            canEdit: rp.canEdit,
            canDelete: rp.canDelete,
          };
        }
      });

      return successResponse(
        res,
        { permissions, isAdmin: false },
        "Permissions fetched",
        "my-permissions",
      );
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/college-custom-role-permissions?roleGroupId=<id>
   * Returns all permissions for a given role group (with planModule codes).
   */
  router.get("/college-custom-role-permissions", async (req, res, next) => {
    try {
      const { roleGroupId } = req.query;
      if (!roleGroupId) {
        return res
          .status(400)
          .json({ success: false, message: "roleGroupId is required" });
      }
      const perms = await models.collegeCustomRolePermissions.findAll({
        where: { collegeCustomRoleGroupId: roleGroupId },
        include: [
          {
            model: models.planModules,
            as: "planModule",
            attributes: ["id", "code", "name"],
          },
        ],
      });
      return successResponse(
        res,
        perms,
        "Permissions fetched",
        "college-custom-role-permissions",
      );
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/college-custom-role-permissions/batch
   * Body: { roleGroupId, permissions: [{ planModuleId, canView, canCreate, canEdit, canDelete }] }
   * Upserts all permissions for a role group at once.
   */
  router.post(
    "/college-custom-role-permissions/batch",
    async (req, res, next) => {
      try {
        const { roleGroupId, permissions } = req.body;
        if (!roleGroupId || !Array.isArray(permissions)) {
          return res.status(400).json({
            success: false,
            message: "roleGroupId and permissions[] are required",
          });
        }

        for (const perm of permissions) {
          const { planModuleId, canView, canCreate, canEdit, canDelete } = perm;

          const existing = await models.collegeCustomRolePermissions.findOne({
            where: { collegeCustomRoleGroupId: roleGroupId, planModuleId },
          });

          if (existing) {
            await existing.update({ canView, canCreate, canEdit, canDelete });
          } else {
            await models.collegeCustomRolePermissions.create({
              collegeCustomRoleGroupId: roleGroupId,
              planModuleId,
              canView,
              canCreate,
              canEdit,
              canDelete,
            });
          }
        }

        return successResponse(
          res,
          {},
          "Permissions saved",
          "college-custom-role-permissions/batch",
        );
      } catch (err) {
        next(err);
      }
    },
  );
};
