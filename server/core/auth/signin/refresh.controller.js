import successResponse from "../../../utils/responses/successResponse.js";
import { AuthException } from "../../../exceptions/index.js";
import { extractRefreshToken } from "../../../passport/jwt.passport.js";

import { models } from "../../../../configs/server.config.js";
import { signAccessToken, verifyRefreshToken } from "../../../lib/jwt.js";

const { user, accessToken, refreshToken } = models;

const refreshUserToken = async (req, res, next) => {
  try {
    const extractedRefreshToken = extractRefreshToken(req);

    const refreshTokenPayload = await verifyRefreshToken(extractedRefreshToken);

    if (!refreshTokenPayload?.sub)
      throw new AuthException("invalidRefreshToken", "auth");

    const existingRefreshToken = await refreshToken.findOne({
      where: { refreshToken: extractedRefreshToken, isActive: true },
    });

    if (
      !existingRefreshToken ||
      existingRefreshToken.userId !== refreshTokenPayload?.sub
    )
      throw new AuthException("invalidRefreshToken", "auth");

    const existingUser = await user.findOne({
      where: { userId: existingRefreshToken.userId },
    });

    if (!existingUser) throw new AuthException("invalidRefreshToken", "auth");

    const newAccessToken = await signAccessToken({
      userId: existingUser?.userId,
      userType: existingUser?.userType,
    });

    const accessTokenPayload = {
      userId: existingUser?.userId,
      accessToken: newAccessToken,
      ip: req?.ip,
    };

    await accessToken.create(accessTokenPayload);

    existingRefreshToken.timesUsed = existingRefreshToken.timesUsed + 1;
    await existingRefreshToken.save();

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return successResponse(
      res,
      "Token refreshed successfully!",
      "tokenRefreshed",
      "Refresh",
    );
  } catch (error) {
    next(error);
  }
};

export default {
  refreshUserToken,
};
