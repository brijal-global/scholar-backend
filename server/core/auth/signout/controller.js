import { AuthException } from "../../../exceptions/index.js";
import successResponse from "../../../utils/responses/successResponse.js";

import { cookieConfig, models } from "../../../../configs/server.config.js";
import {
  extractAccessToken,
  extractRefreshToken,
} from "../../../passport/jwt.passport.js";

const { accessTokens, refreshTokens } = models;

const signOutUser = async (req, res, next) => {
  try {
    const accessTokenFromCookie = extractAccessToken(req);
    const refreshTokenFromCookie = extractRefreshToken(req);

    if (!accessTokenFromCookie && !refreshTokenFromCookie)
      throw new AuthException("Signed out already!", "signout");

    if (accessTokenFromCookie) {
      await accessTokens.update(
        { isActive: false },
        { where: { accessToken: accessTokenFromCookie } },
      );
    }

    if (refreshTokenFromCookie) {
      await refreshTokens.update(
        { isActive: false },
        { where: { refreshToken: refreshTokenFromCookie } },
      );
    }

    res.clearCookie("accessToken", {
      ...cookieConfig,
      maxAge: 0,
    });

    res.clearCookie("refreshToken", {
      ...cookieConfig,
      maxAge: 0,
    });

    return successResponse(
      res,
      "User signed out successfully!",
      "loggedOut",
      "auth.signout",
    );
  } catch (error) {
    next(error);
  }
};

export default { signOutUser };
