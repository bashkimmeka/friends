import jwt from "jsonwebtoken";
import { get as getConfig } from "config";

export class TokenService {
  generatePasswordResetToken = (email: string): string => {
    return jwt.sign({ email: email }, getConfig("app_secret"), {
      expiresIn: getConfig("token_expire"),
    });
  };

  generateLoginToken = (userId: string): string => {
    return jwt.sign({ userId: userId }, getConfig("app_secret"), {
      expiresIn: getConfig("token_expire"),
    });
  };

  verifyToken = (token: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, getConfig("app_secret"), (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });
  };
}
