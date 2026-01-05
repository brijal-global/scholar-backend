import successResponse from "../../../utils/responses/successResponse.js";
import { frontend, superAdmin } from "../../../../configs/env.config.js";
import { models } from "../../../../configs/server.config.js";
import { hashPassword } from "../../../lib/bcrypt.js";
import { superAdminRoleId } from "../../../../configs/server.config.js";

const { users, roles, accessTokens, refreshTokens } = models;

const resetSuperAdmin = async (req, res, next) => {
  try {
    const superAdminRole = await roles.findOne({
      where: { id: superAdminRoleId },
    });

    if (superAdminRole) {
      const superAdminUsers = await users.findAll({
        where: { roleId: superAdminRoleId },
      });

      for (const user of superAdminUsers) {
        await accessTokens.destroy({
          where: { id: user.id },
        });
        await refreshTokens.destroy({
          where: { id: user.id },
        });
      }

      await users.destroy({
        where: { roleId: superAdminRoleId },
      });

      await roles.destroy({
        where: { id: superAdminRoleId },
      });
    }

    await roles.create({
      id: superAdminRoleId,
      name: "superAdmin",
      ip: req.ip,
    });

    const superAdminPayload = {
      roleId: superAdminRoleId,
      firstName: superAdmin.firstName,
      lastName: superAdmin.lastName,
      email: superAdmin.email,
      phone: superAdmin.phone,
      password: await hashPassword(superAdmin.password),
      profileImage: `${frontend.mainUrl}/favicon.ico`,
      gender: "male",
      address: "Kathmandu, Nepal",
      ip: req.ip,
      isTermsAndConditionsAccepted: true,
    };

    await users.create(superAdminPayload);

    return successResponse(res, "Success!", "update", "settings");
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export default {
  resetSuperAdmin,
};
