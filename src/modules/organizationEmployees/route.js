import { models, ids } from "../../../configs/server.config.js";
import { hashPassword } from "../../../server/lib/bcrypt.js";
import successResponse from "../../../server/utils/responses/successResponse.js";

function generateRandomPassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export default (router) => {
  /**
   * GET /api/organization-employees-with-info
   * Query: collegeId (required)
   * Returns non-admin employees joined with user name/email and role group name.
   */
  router.get("/organization-employees-with-info", async (req, res, next) => {
    try {
      const { collegeId, limit = 200 } = req.query;

      if (!collegeId) {
        return res
          .status(400)
          .json({ success: false, message: "collegeId is required" });
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
            attributes: ["id", "name", "isAdmin"],
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

      /* Exclude employees whose role group is the admin group */
      const result = employees
        .filter((emp) => !emp.roleGroup?.isAdmin)
        .map((emp) => ({
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

  /**
   * POST /api/organization-employees/create-or-link
   *
   * Body: { firstName, lastName, email, phone, designation,
   *         collegeCustomRoleGroupId, entry?, associatedModuleId?, collegeId }
   *
   * Logic:
   *   1. If a user with that email already exists → link them as an employee.
   *   2. If not → create a new user account (random temp password) then link.
   *
   * Returns: { employee, user: { id, email }, isNewUser: boolean }
   */
  router.post(
    "/organization-employees/create-or-link",
    async (req, res, next) => {
      try {
        const {
          firstName,
          lastName,
          email,
          phone,
          designation,
          collegeCustomRoleGroupId,
          entry,
          associatedModuleId,
          collegeId,
        } = req.body;

        /* ── validation ── */
        if (!email?.trim())
          return res
            .status(400)
            .json({ success: false, message: "Email is required" });
        if (!firstName?.trim() || !lastName?.trim())
          return res.status(400).json({
            success: false,
            message: "First name and last name are required",
          });
        if (!designation?.trim())
          return res
            .status(400)
            .json({ success: false, message: "Designation is required" });
        if (!collegeCustomRoleGroupId)
          return res
            .status(400)
            .json({ success: false, message: "Role group is required" });
        if (!collegeId)
          return res
            .status(400)
            .json({ success: false, message: "College ID is required" });

        const normalizedEmail = email.trim().toLowerCase();

        /* ── look up existing user ── */
        let user = await models.users.findOne({
          where: { email: normalizedEmail },
        });
        let isNewUser = false;

        if (!user) {
          /* Create new user with a random temporary password */
          const rawPassword = normalizedEmail;
          const hashed = await hashPassword(rawPassword);
          user = await models.users.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            phone: phone?.trim() || null,
            password: hashed,
            roleId: ids.organizationEmployeeRoleId,
            gender: "other",
            address: "",
            isTermsAndConditionsAccepted: true,
            isEmailVerified: false,
            ip: req.ip,
          });
          isNewUser = true;
        } else {
          /* Check for duplicate membership at this college */
          const existing = await models.organizationEmployees.findOne({
            where: { userId: user.id, collegeId },
          });
          if (existing) {
            return res.status(409).json({
              success: false,
              message:
                "A user with this email is already an employee of this college",
            });
          }
        }

        /* ── create the employee record ── */
        const employee = await models.organizationEmployees.create({
          userId: user.id,
          collegeId,
          collegeCustomRoleGroupId,
          designation: designation.trim(),
          entry: entry || null,
          associatedModuleId: associatedModuleId || null,
          ip: req.ip,
        });

        return successResponse(
          res,
          {
            employee,
            user: {
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            },
            isNewUser,
          },
          isNewUser
            ? "New user account created and linked as employee"
            : "Existing user linked as employee",
          "organization-employees/create-or-link",
        );
      } catch (err) {
        next(err);
      }
    },
  );
};
