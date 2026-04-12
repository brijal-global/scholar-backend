import jwt from "jsonwebtoken";
import { jwtConfig } from "../../configs/env.config.js";
import { AuthException } from "../exceptions/index.js";

const signAccessToken = (id, roleId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      sub: id,
      roleId: roleId,
      iat: Date.now(),
    };

    const expiresIn = jwtConfig.accessTokenExpiresIn;

    jwt.sign(
      payload,
      jwtConfig.accessTokenSecret,
      { expiresIn, algorithm: "HS256" },
      (err, token) => {
        if (err) {
          console.error("Error signing access token: ", err.message);
          reject(new Error("Failed to sign access token"));
          return;
        }
        resolve(token);
      },
    );
  });
};

const signRefreshToken = (id, roleId) => {
  return new Promise((resolve, reject) => {
    const payload = {
      sub: id,
      roleId: roleId,
      iat: Date.now(),
    };

    const expiresIn = jwtConfig.refreshTokenExpiresIn;

    jwt.sign(
      payload,
      jwtConfig.refreshTokenSecret,
      { expiresIn, algorithm: "HS256" },
      (err, token) => {
        if (err) {
          console.error("Error signing refresh token: ", err.message);
          reject(new Error("Failed to sign refresh token"));
          return;
        }
        resolve(token);
      },
    );
  });
};

const signGeneralToken = (id, roleId, type) => {
  return new Promise((resolve, reject) => {
    const payload = {
      sub: id,
      roleId: roleId,
      type: type,
      iat: Date.now(),
    };

    const expiresIn = jwtConfig.generalTokenExpiresIn;

    jwt.sign(
      payload,
      jwtConfig.generalTokenSecret,
      { expiresIn, algorithm: "HS256" },
      (err, token) => {
        if (err) {
          console.error("Error signing general token: ", err.message);
          reject(new Error("Failed to sign general token"));
          return;
        }
        resolve(token);
      },
    );
  });
};

const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    jwt.verify(refreshToken, jwtConfig.refreshTokenSecret, (err, payload) => {
      if (err) {
        console.error("Error verifying refresh token: ", err.message);
        reject(new AuthException("invalidRefreshToken", "auth"));
        return;
      }
      resolve(payload);
    });
  });
};

const verifyGeneralToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtConfig.generalTokenSecret, (err, payload) => {
      if (err) {
        console.error("Token validation failed: ", err.message);
        reject(new AuthException("invalidToken", "auth"));
        return;
      }
      resolve(payload);
    });
  });
};

export {
  signAccessToken,
  signRefreshToken,
  signGeneralToken,
  verifyRefreshToken,
  verifyGeneralToken,
};
