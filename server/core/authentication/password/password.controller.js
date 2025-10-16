import { AuthException, HttpException } from "../../../exceptions/index.js";
import successResponse from "../../../utils/responses/successResponse.js";
import { models } from "../../../../configs/server.config.js";
import { hashPassword, verifyHashedPassword } from "../../../lib/bcrypt.js";

const changeMyPassword = async (req, res, next) => {
  try {
    const userData = req?.user;
    if (!userData) throw new AuthException("unauthorized", "auth");

    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new HttpException(
        400,
        "Required all fields including currentPassword, newPassword and confirmPassword!",
        "change password",
      );
    }

    if (newPassword.length < 8) {
      throw new HttpException(
        400,
        "Password must be at least 8 characters long!",
        "change password",
      );
    }

    if (newPassword !== confirmPassword) {
      throw new HttpException(
        400,
        "Passwords do not match!",
        "change password",
      );
    }

    const userType = userData?.user?.userType;
    const model = models[userType];

    if (!model) throw new HttpException(404, "User model not found!", "auth");

    const isPasswordValid = await verifyHashedPassword(
      currentPassword,
      userData?.password,
    );

    if (!isPasswordValid) {
      throw new AuthException("Invalid current password!", "change password");
    }

    const hashedPassword = await hashPassword(newPassword);
    await model.update(
      { password: hashedPassword },
      {
        where: { id: userData.id },
      },
    );

    return successResponse(res, {}, "update", "password");
  } catch (err) {
    next(err);
  }
};

export default { changeMyPassword };
