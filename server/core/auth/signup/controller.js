import { hashPassword } from "../../../lib/bcrypt.js";
import successResponse from "../../../utils/responses/successResponse.js";
import {
  ConflictException,
  ForbiddenException,
  HttpException,
} from "../../../exceptions/index.js";
import { initiateEmailVerification } from "../emailVerification/controller.js";

import { models } from "../../../../configs/server.config.js";

const { users, roles } = models;

const signupUser = async (req, res, next) => {
  try {
    const { roleName } = req.params;
    const { email, isTermsAndConditionsAccepted } = req.body;

    if (roleName === "superAdmin") {
      throw new ForbiddenException(
        "Super admin signup is not allowed! Please use the super admin reset route instead.",
        "auth.signup",
      );
    }

    const role = await roles.findOne({
      where: { name: roleName },
      raw: true,
    });

    if (!role) throw new HttpException(404, "Role not found!", "auth.signup");

    let existingUser = await users.findOne({
      where: { email },
      raw: true,
    });

    if (existingUser)
      throw new ConflictException(
        "User with this email already exists!",
        "auth.signup",
      );

    if (
      isTermsAndConditionsAccepted !== true &&
      isTermsAndConditionsAccepted !== "true"
    ) {
      throw new ForbiddenException(
        "You must accept the terms and conditions to sign up!",
        "auth.signup",
      );
    }

    const userPayload = {
      ...req.body,
      roleId: role.id,
      password: await hashPassword(req.body.password),
      ip: req.ip,
    };

    const createdUser = await users.create(userPayload);

    initiateEmailVerification(createdUser, req.ip);

    return successResponse(res, {}, "create", "user");
  } catch (error) {
    next(error);
  }
};

export default {
  signupUser,
};
