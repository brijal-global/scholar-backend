import { AuthException, HttpException } from "../../../exceptions/index.js";
import successResponse from "../../../utils/responses/successResponse.js";
import { frontend } from "../../../../configs/env.config.js";
import { signAccessToken, signRefreshToken } from "../../../lib/jwt.js";
import { verifyHashedPassword } from "../../../lib/bcrypt.js";
import { models } from "../../../../configs/server.config.js";

const { user: commonUserModel, accessToken, refreshToken } = models;

const signInUser = async (req, res, next) => {
  try {
    const userType = req.params.userType;

    const { email } = req.body;

    // Check if the model exists first
    if (!models[userType]) {
      throw new HttpException(404, `User type '${userType}' not found`, "auth");
    }

    const userRepository = models[userType];

    const existingUser = await userRepository.findOne({
      where: { email },
      include: [
        {
          model: commonUserModel,
          as: "user",
        },
      ],
    });

    if (!existingUser) throw new AuthException("invalidCredential", userType);

    const { password } = req.body;
    const hashedPassword = existingUser.password;

    if (!hashedPassword && existingUser?.oAuthId) {
      const oauthProvider = existingUser?.oAuthProvider;
      throw new HttpException(
        403,
        "Please sign in with " +
          oauthProvider +
          " as you have signed up with " +
          oauthProvider,
        "OAuth",
      );
    }

    const isMatch = await verifyHashedPassword(password, hashedPassword);

    if (!isMatch) throw new AuthException("invalidCredential", "");

    processAuth(req, res, next, existingUser, "response");
  } catch (error) {
    next(error);
  }
};

export const processAuth = async (
  req,
  res,
  next,
  user,
  responseType = "response",
) => {
  try {
    const userType = user?.user?.userType;
    if (!userType) throw new HttpException(404, "User type not found", "auth");

    const newAccessToken = await signAccessToken({
      userId: user?.userId,
      userType,
    });
    const newRefreshToken = await signRefreshToken({
      userId: user?.userId,
      userType,
    });

    let accessTokenPayload = {
      userId: user?.userId,
      accessToken: newAccessToken,
      ip: req?.ip,
    };

    let refreshTokenPayload = {
      userId: user.userId,
      refreshToken: newRefreshToken,
      ip: req?.ip,
    };

    await accessToken.create(accessTokenPayload);
    await refreshToken.create(refreshTokenPayload);

    // Update last login time
    commonUserModel
      .update({ lastLogin: new Date() }, { where: { userId: user.userId } })
      .catch((err) => console.error("Error updating last login:", err));

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    if (responseType === "redirect") {
      // Redirect to frontend
      const redirectUrl = `${frontend.mainUrl}/dashboard`;
      return res.redirect(redirectUrl);
    } else {
      return successResponse(
        res,
        "Logged in successfully!",
        "loggedIn",
        userType,
      );
    }
  } catch (error) {
    next(error);
  }
};

export default { signInUser };
