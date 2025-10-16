import { AuthException } from "../../../exceptions/index.js";
import successResponse from "../../../utils/responses/successResponse.js";
import { signGeneralToken, verifyGeneralToken } from "../../../lib/jwt.js";
import { backend, frontend } from "../../../../configs/env.config.js";

import { models } from "../../../../configs/server.config.js";
import sendEmail from "../../../utils/mail/nodeMailer.js";
const { token, user } = models;

const initiateEmailVerification = async (user, ip) => {
  try {
    const verificationToken = await signGeneralToken({
      userId: user.userId,
      type: "emailVerification",
      ip: ip,
    });

    // save the token in the database
    const tokenPayload = {
      userId: user.userId,
      token: verificationToken,
      type: "emailVerification",
      ip: ip,
    };

    await token.create(tokenPayload);

    // send mail
    const mailData = {
      reciever: user.email,
      subject: "Verify your email",
      templateFile: "emailVerificationMail.ejs",
      variables: {
        name: user.firstName,
        link: `${backend.mainUrl}/api/auth/verify-email/${verificationToken}`,
      },
      priority: "normal",
    };

    await sendEmail(mailData);
  } catch (error) {
    console.error(error);
  }
};

const resendVerificationEmail = async (req, res, next) => {
  try {
    const { userType, email } = req.params || {};

    if (!userType || !email) {
      throw new AuthException("invalidRequest", "email verification");
    }

    const userModel = models?.[userType];

    if (!userModel) {
      throw new AuthException("invalidUserType", "email verification");
    }

    const existingUser = await userModel.findOne({
      where: {
        email,
      },
    });

    if (!existingUser) {
      throw new AuthException("userNotFound", "email verification");
    }

    if (existingUser?.isEmailVerified) {
      throw new AuthException("emailAlreadyVerified", "email verification");
    }

    await initiateEmailVerification(existingUser, req.ip);

    return successResponse(
      res,
      "verification email sent",
      "send",
      "verification email",
    );
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const verifyEmail = async (req, res) => {
  try {
    const verificationToken = req.params.token;

    const tokenData = await verifyGeneralToken(verificationToken);
    if (!tokenData)
      return res.redirect(`${frontend.mainUrl}/email-verification/failed`);

    const savedToken = await token.findOne({
      where: {
        token: verificationToken,
        type: "emailVerification",
        isUsed: false,
        isActive: true,
      },
      include: [
        {
          model: user,
          as: "user",
        },
      ],
    });

    if (!savedToken || !savedToken.user) {
      return res.redirect(`${frontend.mainUrl}/email-verification/failed`);
    }

    const userModel = models?.[savedToken?.user?.userType];

    if (!userModel) {
      throw new AuthException("invalidToken", "email verification");
    }

    // pre set condition and update
    const condition = {
      userId: savedToken.user.userId,
    };

    const payload = {
      isEmailVerified: true,
    };

    const updatedUser = await userModel.update(payload, {
      where: condition,
      returning: true,
    });

    if (!updatedUser[1][0]?.isEmailVerified) {
      throw new AuthException("failedToVerifyEmail", "email verification");
    }

    savedToken.isUsed = true;
    savedToken.isActive = false;

    await savedToken.save();

    return res.redirect(`${frontend.mainUrl}/email-verification/success`);
  } catch (error) {
    console.error(error);
    return res.redirect(`${frontend.mainUrl}/email-verification/failed`);
  }
};

export { initiateEmailVerification, resendVerificationEmail, verifyEmail };
