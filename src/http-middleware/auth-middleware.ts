/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { HTTP_CODE } from "../enums/http-status-codes";
import { TokenService } from "../services/tokenService";

export class AuthMiddleware {
  tokenService: TokenService = new TokenService();
  handleRequest = (
    req: any,
    res: any,
    reqUrl: any,
    authorization: boolean,
    callback: any
  ): void => {
    if (authorization) {
      if (!req.headers["authorization"]) {
        res.writeHead(HTTP_CODE.Unauthorized);
        res.write(JSON.stringify({ message: "unauthorized" }));
        res.end();
      } else {
        this.tokenService
          .verifyToken(this.getTokenFromHeader(req.headers["authorization"]))
          .then((result) => {
            req.user = result.userId;
            callback(req, res, reqUrl);
          })
          .catch(() => {
            res.writeHead(HTTP_CODE.Unauthorized);
            res.write(JSON.stringify({ message: "Invalid token" }));
            res.end();
          });
      }
    } else {
      callback(req, res, reqUrl);
    }
  };

  getTokenFromHeader = (authHeader: string): string => {
    return authHeader.replace("JWT ", "").trim();
  };
}
