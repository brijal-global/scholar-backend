import { createUser } from "./repository.js";
import { ids, models } from "../../../configs/server.config.js";
import { hashPassword } from "../../../server/lib/bcrypt.js";
import { seedPlanModules } from "../permissions/route.js";

const { roles, colleges, organizationEmployees, collegeCustomRoleGroups } =
  models;

const organizationEmployeeRoleId = ids.organizationEmployeeRoleId;

export const createCollegeOwner = async (payload) => {
  const orgEmployeeRole = await roles.findOne({
    where: { id: organizationEmployeeRoleId },
    raw: true,
  });

  if (!orgEmployeeRole) {
    await roles.create({
      id: organizationEmployeeRoleId,
      name: "organizationEmployee",
      slug: "organization-employee",
      description: "Organization employee role",
      ip: payload?.ip,
      isActive: true,
    });
  }

  const collegeOwnerPayload = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone || null,
    gender: payload.gender || "other",
    address: payload.address || "",
    roleId: organizationEmployeeRoleId,
    isTermsAndConditionsAccepted: true,
    isEmailVerified: false,
    ip: payload.ip,
  };

  if (payload?.password) {
    collegeOwnerPayload.password = await hashPassword(payload.password);
  }

  const user = await createUser(collegeOwnerPayload);

  const college = await colleges.create({
    name: payload.collegeName,
    collegeType: payload.collegeType,
    country: payload.country,
    city: payload.city,
    streetAddress: payload.streetAddress,
    ip: payload.ip,
    createdBy: user.id,
    updatedBy: user.id,
  });

  const adminRoleGroup = await collegeCustomRoleGroups.create({
    collegeId: college.id,
    name: "Admin",
    description: "Default administrator role group",
    isAdmin: true,
    ip: payload.ip,
    createdBy: user.id,
    updatedBy: user.id,
  });

  await organizationEmployees.create({
    userId: user.id,
    collegeId: college.id,
    collegeCustomRoleGroupId: adminRoleGroup.id,
    designation: "Administrator",
    entry: new Date(),
    ip: payload.ip,
    createdBy: user.id,
    updatedBy: user.id,
  });

  // Ensure system planModules exist, then grant Admin full permissions
  try {
    await seedPlanModules();
    const allPlanModules = await models.planModules.findAll({
      where: { isSystemModule: true, isActive: true },
    });
    await Promise.all(
      allPlanModules.map((pm) =>
        models.collegeCustomRolePermissions.create({
          collegeCustomRoleGroupId: adminRoleGroup.id,
          planModuleId: pm.id,
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
          ip: payload.ip,
          createdBy: user.id,
          updatedBy: user.id,
        }),
      ),
    );
  } catch (e) {
    console.warn("Warning: could not seed admin permissions", e.message);
  }

  await user.reload({
    include: [
      {
        model: roles,
        as: "role",
        attributes: ["id", "name"],
      },
    ],
  });

  return user;
};
