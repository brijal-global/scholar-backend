import { AuthException } from "../../../exceptions/index.js";
import successResponse from "../../../utils/responses/successResponse.js";

import { models } from "../../../../configs/server.config.js";
import { extractAccessToken } from "../../../passport/jwt.passport.js";

const { accessToken } = models;

const signOutUser = async (req, res, next) => {
  try {
    const accessTokenFromCookie = extractAccessToken(req);

    if (!accessTokenFromCookie)
      throw new AuthException("Signed out already!", "signout");

    await accessToken.update(
      {
        isActive: false,
      },
      {
        where: {
          accessToken: accessTokenFromCookie,
        },
      },
    );

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
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
