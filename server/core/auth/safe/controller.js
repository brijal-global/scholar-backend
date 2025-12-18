import successResponse from "../../../utils/responses/successResponse.js";
import { frontend, superAdmin } from "../../../../configs/env.config.js";
import { models } from "../../../../configs/server.config.js";
import { hashPassword } from "../../../lib/bcrypt.js";

const { users, roles, accessTokens, refreshTokens } = models;

const resetSuperAdmin = async (req, res, next) => {
  try {
    const superAdminRole = await roles.findOne({
      where: { name: "superAdmin" },
    });

    if (superAdminRole) {
      const superAdminUsers = await users.findAll({
        where: { roleId: superAdminRole.id },
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
        where: { roleId: superAdminRole.id },
      });

      await roles.destroy({
        where: { id: superAdminRole.id },
      });
    }

    const newRole = await roles.create({
      name: "superAdmin",
      ip: req.ip,
    });

    const superAdminPayload = {
      roleId: newRole.id,
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
