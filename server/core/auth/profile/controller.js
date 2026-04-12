import { AuthException } from "../../../exceptions/index.js";
import successResponse from "../../../utils/responses/successResponse.js";
import { models } from "../../../../configs/server.config.js";
import { sanitizePayload } from "../../../utils/filters/payloadFilter.js";

const { users } = models;

const currentUser = async (req, res, next) => {
  try {
    if (!req?.user) throw new AuthException("unauthorized", "auth");

    let userData = req?.user;

    userData = sanitizePayload(userData, ["password"]);

    return successResponse(res, userData, "fetch", "auth");
  } catch (err) {
    next(err);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const userData = req?.user;
    if (!userData) throw new AuthException("unauthorized", "auth");

    let payload = req?.body;

    payload = sanitizePayload(payload, [
      "password",
      "oldPassword",
      "newPassword",
      "confirmPassword",
      "id",
      "email",
      "confirmEmail",
      "oAuthId",
      "oAuthProvider",
    ]);

    await users.update(payload, {
      where: { id: userData.id },
    });

    return successResponse(res, {}, "update", "profile");
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export default { currentUser, updateMyProfile };
