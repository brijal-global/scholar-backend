import {
  AuthException,
  ForbiddenException,
} from "../../../exceptions/index.js";
import successResponse from "../../../utils/responses/successResponse.js";
import { frontend, jwtConfig } from "../../../../configs/env.config.js";
import { signAccessToken, signRefreshToken } from "../../../lib/jwt.js";
import { verifyHashedPassword } from "../../../lib/bcrypt.js";
import { cookieConfig, models } from "../../../../configs/server.config.js";
import { convertJwtTimeToSeconds } from "../../../utils/helpers/timeFormatters.js";

const { users, roles, accessTokens, refreshTokens } = models;

const signInUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await users.findOne({
      where: { email },
      include: [
        {
          model: roles,
          as: "role",
          attributes: ["id", "name", "slug"],
          required: true,
        },
      ],
    });

    if (!existingUser)
      throw new AuthException("Invalid credentials!", "auth.signin");

    const hashedPassword = existingUser.password;

    if (!hashedPassword && existingUser?.oAuthProvider) {
      const oauthProvider = existingUser?.oAuthProvider;
      throw new ForbiddenException(
        `This account uses ${oauthProvider} to sign in.`,
        "auth.signin",
      );
    }

    const isMatch = await verifyHashedPassword(password, hashedPassword);

    if (!isMatch)
      throw new AuthException("Invalid credentials!", "auth.signin");

    if (existingUser?.isActive !== true) {
      throw new ForbiddenException(
        "This account is not active. Please contact support or your administrator.",
        "auth.signin",
      );
    }

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
    const roleId = user?.roleId;

    if (!roleId) throw new ForbiddenException("Role not found!", "auth.signin");

    const newAccessToken = await signAccessToken(user.id, roleId);

    const newRefreshToken = await signRefreshToken(user.id, roleId);

    let accessTokenPayload = {
      userId: user.id,
      accessToken: newAccessToken,
      ip: req?.ip,
    };

    let refreshTokenPayload = {
      userId: user.id,
      refreshToken: newRefreshToken,
      ip: req?.ip,
    };

    const accessTokenExpiresInSeconds = convertJwtTimeToSeconds(
      jwtConfig.accessTokenExpiresIn,
    );
    const refreshTokenExpiresInSeconds = convertJwtTimeToSeconds(
      jwtConfig.refreshTokenExpiresIn,
    );

    await accessTokens.create(accessTokenPayload);
    await refreshTokens.create(refreshTokenPayload);

    res.cookie("accessToken", newAccessToken, {
      ...cookieConfig,
      priority: "high",
      maxAge: accessTokenExpiresInSeconds * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      ...cookieConfig,
      priority: "high",
      maxAge: refreshTokenExpiresInSeconds * 1000,
    });

    if (responseType === "redirect") {
      const redirectUrl = `${frontend.mainUrl}/auth`;
      return res.redirect(redirectUrl);
    } else {
      return successResponse(
        res,
        "Logged in successfully!",
        "loggedIn",
        roleId,
      );
    }
  } catch (error) {
    next(error);
  }
};

export default { signInUser };
