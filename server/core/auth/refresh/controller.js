import successResponse from "../../../utils/responses/successResponse.js";
import { AuthException } from "../../../exceptions/index.js";
import { extractRefreshToken } from "../../../passport/jwt.passport.js";
import { cookieConfig, models } from "../../../../configs/server.config.js";
import { jwtConfig } from "../../../../configs/env.config.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../../lib/jwt.js";
import { convertJwtTimeToSeconds } from "../../../utils/helpers/timeFormatters.js";

const { users, roles, accessTokens, refreshTokens } = models;

const refreshUserToken = async (req, res, next) => {
  try {
    const extractedRefreshToken = extractRefreshToken(req);

    if (!extractedRefreshToken)
      throw new AuthException("Invalid refresh token!", "auth.refresh");

    const refreshTokenPayload = await verifyRefreshToken(extractedRefreshToken);

    if (!refreshTokenPayload?.sub)
      throw new AuthException("Invalid refresh token!", "auth.refresh");

    const existingRefreshToken = await refreshTokens.findOne({
      where: { refreshToken: extractedRefreshToken, isActive: true },
      raw: true,
    });

    if (
      !existingRefreshToken ||
      existingRefreshToken.userId !== refreshTokenPayload?.sub
    )
      throw new AuthException("Invalid refresh token!", "auth.refresh");

    const existingUser = await users.findOne({
      where: { id: refreshTokenPayload.sub },
      raw: true,
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
      throw new AuthException("Invalid refresh token!", "auth.refresh");

    await refreshTokens.update(
      { isActive: false },
      { where: { refreshToken: extractedRefreshToken } },
    );

    const newAccessToken = await signAccessToken(
      existingUser?.id,
      existingUser?.roleId,
    );

    const newRefreshToken = await signRefreshToken(
      existingUser?.id,
      existingUser?.roleId,
    );

    const newAccessTokenPayload = {
      userId: existingUser?.id,
      accessToken: newAccessToken,
      ip: req?.ip,
    };

    const newRefreshTokenPayload = {
      userId: existingUser?.id,
      refreshToken: newRefreshToken,
      ip: req?.ip,
    };

    await accessTokens.create(newAccessTokenPayload);
    await refreshTokens.create(newRefreshTokenPayload);

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

    return successResponse(
      res,
      "Token refreshed successfully!",
      "refreshed",
      "auth.refresh",
    );
  } catch (error) {
    next(error);
  }
};

export default {
  refreshUserToken,
};
