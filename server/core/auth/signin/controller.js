import {
  AuthException,
  ForbiddenException,
} from "../../../exceptions/index.js";
import successResponse from "../../../utils/responses/successResponse.js";
import { frontend, jwtConfig } from "../../../../configs/env.config.js";
import { signAccessToken, signRefreshToken } from "../../../lib/jwt.js";
import { verifyHashedPassword } from "../../../lib/bcrypt.js";
import { cookieConfig, models } from "../../../../configs/server.config.js";
import {
  convertJwtTimeToSeconds,
  getUtcTimestamp,
} from "../../../utils/helpers/timeFormatters.js";

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
          attributes: ["name"],
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
        `Please sign in with ${oauthProvider} as you have signed up with ${oauthProvider}`,
        "auth.signin",
      );
    }

    const isMatch = await verifyHashedPassword(password, hashedPassword);

    if (!isMatch)
      throw new AuthException("Invalid credentials!", "auth.signin");

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
    const role = user?.role?.name;

    if (!role) throw new ForbiddenException("Role not found!", "auth.signin");

    const newAccessToken = await signAccessToken(user.id, role);

    const newRefreshToken = await signRefreshToken(user.id, role);

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

    await accessTokens.create(accessTokenPayload);
    await refreshTokens.create(refreshTokenPayload);

    // Update last login time
    users
      .update({ lastLogin: getUtcTimestamp() }, { where: { id: user.id } })
      .catch((err) => console.error("Error updating last login: ", err));

    res.cookie("accessToken", newAccessToken, {
      ...cookieConfig,
      priority: "high",
      maxAge: convertJwtTimeToSeconds(jwtConfig.accessTokenExpiresIn) * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      ...cookieConfig,
      priority: "high",
      maxAge: convertJwtTimeToSeconds(jwtConfig.refreshTokenExpiresIn) * 1000,
    });

    if (responseType === "redirect") {
      // Redirect to frontend
      const redirectUrl = `${frontend.mainUrl}/dashboard`;
      return res.redirect(redirectUrl);
    } else {
      return successResponse(res, "Logged in successfully!", "loggedIn", role);
    }
  } catch (error) {
    next(error);
  }
};

export default { signInUser };
