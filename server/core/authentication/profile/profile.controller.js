import { AuthException, HttpException } from "../../../exceptions/index.js";
import successResponse from "../../../utils/responses/successResponse.js";
import { models } from "../../../../configs/server.config.js";
import { sanitizePayload } from "../../../utils/filters/payloadFilter.js";

const currentUser = async (req, res, next) => {
  try {
    if (!req?.user) throw new AuthException("unauthorized", "auth");

    let userData = req?.user?.dataValues;

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
      "userId",
      "email",
      "confirmEmail",
      "oAuthId",
      "oAuthProvider",
    ]);

    const userType = userData?.user?.userType;
    const model = models[userType];

    if (!model) throw new HttpException(404, "User model not found!", "auth");

    await model.update(payload, {
      where: { id: userData.id },
    });

    return successResponse(res, {}, "update", "profile");
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export default { currentUser, updateMyProfile };
