/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import http from "http";
import fs from "fs";
import { IUserInterface, User } from "../db/user";
import { Like } from "../db/likes";
import { HTTP_CODE } from "../enums/http-status-codes";
import { IUser } from "../model/user";
import { ILike } from "../model/like";
import { Passport } from "../db/passport";
import { TokenService } from "../services/tokenService";
import { Token } from "../db/token";
import { IToken } from "../model/token";
import { PasswordService } from "../services/passwordService";

export class HttpRequestHandlers {
  getMostLikedUsers = (req: any, res: any, reqUrl: any): void => {
    User.find()
      .sort([["likesCount", -1]])
      .exec(function (err: string, docs: IUser[]) {
        if (err) {
          res.writeHead(HTTP_CODE.OK, { "Content-Type": "application/json" });
          res.write(JSON.stringify(err));
          res.end();
        } else {
          res.writeHead(HTTP_CODE.OK);
          res.write(JSON.stringify(docs));
          res.end();
        }
      });
  };

  getuser = (req: any, res: any, reqUrl: any): void => {
    User.findOne({ _id: req.id }, (err: string, user: any) => {
      if (err) {
        res.writeHead(HTTP_CODE.OK);
        res.write(JSON.stringify({ message: err }));
        res.end();
      } else {
        res.writeHead(HTTP_CODE.OK);
        res.write(
          JSON.stringify({ username: user.email, likes: user.likesCount })
        );
        res.end();
      }
    });
  };

  updateUser = (req: any, res: any, reqUrl: any): void => {
    req.on("data", (data: any) => {
      const userData: IUser = JSON.parse(data);
      User.updateuser(userData, req.user)
        .then((res) => {
          res.writeHead(HTTP_CODE.OK, { "Content-Type": "application/json" });
          res.write(JSON.stringify(res));
          res.end();
        })
        .catch((err) => {
          res.writeHead(HTTP_CODE.InternalServerError);
          res.write(JSON.stringify(err));
          res.end();
        });
    });
  };

  signup = (
    req: http.ClientRequest,
    res: http.ServerResponse,
    reqUrl: any
  ): void => {
    req.on("data", (data: any) => {
      const dataObj: any = JSON.parse(data);
      User.getUserId(dataObj.user.email)
        .then(() => {
          res.writeHead(HTTP_CODE.Conflict);
          res.write(
            JSON.stringify({
              message: "a user alreay exists with email: " + dataObj.user.email,
            })
          );
          res.end();
        })
        .catch(() => {
          User.create(JSON.parse(data).user, (err: any, result: any) => {
            if (err) {
              res.writeHead(500);
              res.write(JSON.stringify(err));
              res.end();
            } else {
              Passport.createPassport(dataObj.password, result._id).then(
                (passRes) => {
                  if (passRes) {
                    res.writeHead(HTTP_CODE.OK);
                    res.write(JSON.stringify(result));
                    res.end();
                  } else {
                    res.writeHead(500);
                    res.write("A problem ocurred while creating user password");
                    res.end();
                  }
                }
              );
            }
          });
        });
    });
  };

  login = (
    req: http.ClientRequest,
    res: http.ServerResponse,
    reqUrl: any
  ): void => {
    req.on("data", (data: any) => {
      const loginData: any = JSON.parse(data);
      const tokenService = new TokenService();
      const passwordService = new PasswordService();
      User.getUserId(loginData.email)
        .then((userId: string) => {
          Passport.getPassword(userId)
            .then((pwd: string) => {
              passwordService
                .isCorrect(loginData.password, pwd)
                .then((result) => {
                  const token = tokenService.generateLoginToken(userId);
                  tokenService.verifyToken(token).then((decodedToken) => {
                    res.writeHead(HTTP_CODE.OK);
                    res.write(
                      JSON.stringify({
                        token: token,
                        exp: decodedToken.exp,
                      })
                    );
                    res.end();
                  });
                })
                .catch((err) => {
                  res.writeHead(HTTP_CODE.Forbidden);
                  res.write(JSON.stringify({ message: err }));
                  res.end();
                });
            })
            .catch(() => {
              res.writeHead(HTTP_CODE.Forbidden);
              res.write(
                JSON.stringify({ message: "wrong username or password" })
              );
              res.end();
            });
        })
        .catch((err) => {
          res.writeHead(500);
          res.write("User not found: " + err);
          res.end();
        });
    });
  };

  requestPasswordReset = (
    req: http.ClientRequest,
    res: http.ServerResponse,
    reqUrl: any
  ): void => {
    req.on("data", (data: any) => {
      const dataObj: any = JSON.parse(data);
      const tokenService = new TokenService();
      const generatedToken = tokenService.generatePasswordResetToken(
        dataObj.email
      );
      const date = new Date();
      const tokenObj: IToken = {
        token: generatedToken,
        type: "password-reset",
        expire: new Date(date.setHours(date.getHours() + 24)),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      Token.saveToken(tokenObj)
        .then((savedToken: IToken) => {
          res.writeHead(200);
          savedToken.token = "";
          // we could send and email to the user with the token link
          res.write(
            JSON.stringify({
              message:
                "an email with reset password instructions has been sent to: " +
                dataObj.email,
            })
          );
          res.end();
        })
        .catch((err) => {
          res.writeHead(500);
          res.write(err);
          res.end();
        });
    });
  };

  resetPassword = (req: http.ClientRequest, res: http.ServerResponse): void => {
    req.on("data", (data: any) => {
      const dataObj: any = JSON.parse(data);
      const tokenService = new TokenService();
      tokenService
        .verifyToken(dataObj.token)
        .then((result) => {
          Token.validateToken(dataObj.token).then((isValid) => {
            if (isValid) {
              User.getUserId(result.email)
                .then((userID) => {
                  Passport.updatePassword(userID, dataObj.password)
                    .then((newPassword) => {
                      Token.deleteOne({ token: dataObj.token }, {}, (err) => {
                        res.writeHead(HTTP_CODE.OK);
                        res.write(
                          JSON.stringify({
                            message:
                              "your password has been updated successfully!",
                          })
                        );
                        res.end();
                      });
                    })
                    .catch((err) => {
                      res.writeHead(500);
                      res.write(err);
                      res.end();
                    });
                })
                .catch((err) => {
                  res.writeHead(500);
                  res.write(err);
                  res.end();
                });
            } else {
              res.writeHead(HTTP_CODE.Forbidden);
              res.write(
                JSON.stringify({ message: "invalid or expired token" })
              );
              res.end();
            }
          });
        })
        .catch((err) => {
          res.writeHead(HTTP_CODE.Forbidden);
          res.write(JSON.stringify({ message: "invalid or expired token" }));
          res.end();
        });
    });
  };

  resetCurrentUserPassword = (req: any, res: any): void => {
    req.on("data", (data: any) => {
      const dataObj: any = JSON.parse(data);
      Passport.updatePassword(req.user, dataObj.password)
        .then((newPassword) => {
          Token.deleteOne({ token: dataObj.token }, {}, (err) => {
            res.writeHead(HTTP_CODE.OK);
            res.write(
              JSON.stringify({
                message: "your password has been updated successfully!",
              })
            );
            res.end();
          });
        })
        .catch((err) => {
          res.writeHead(500);
          res.write(err);
          res.end();
        });
    });
  };

  likeUser = (req: any, res: http.ServerResponse): void => {
    const likeData: ILike = {
      source: req.user,
      target: req.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    try {
      Like.hasLikedUser(likeData).then((result) => {
        if (result) {
          res.writeHead(HTTP_CODE.Conflict);
          res.write(JSON.stringify({ message: "user has already been liked" }));
          res.end();
        } else {
          User.findById(likeData.target, (err: string, user: any) => {
            if (user !== null && likeData.source !== likeData.target) {
              Like.create(likeData, (createErr: any, result: any) => {
                if (createErr) {
                  res.writeHead(HTTP_CODE.InternalServerError);
                  res.write(JSON.stringify(createErr));
                  res.end();
                } else {
                  User.findOneAndUpdate(
                    { _id: likeData.target },
                    { $inc: { likesCount: 1 } }
                  ).exec();
                  res.writeHead(200);
                  res.write(JSON.stringify(result));
                  res.end();
                }
              });
            } else {
              res.writeHead(200);
              res.write(
                JSON.stringify({
                  message: `User ${likeData.target} could not be liked`,
                })
              );
              res.end();
            }
          });
        }
      });
    } catch (error) {
      res.writeHead(500);
      res.write(JSON.stringify(error));
      res.end();
    }
  };

  unlikeUser = (req: any, res: http.ServerResponse): void => {
    const likeData: ILike = {
      source: req.user,
      target: req.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    try {
      Like.hasLikedUser(likeData).then((result) => {
        if (result) {
          Like.existingLikeUnlike(likeData).then((saved) => {
            if (saved) {
              User.findOneAndUpdate(
                { _id: likeData.target },
                { $inc: { likesCount: -1 } }
              ).exec();
              res.writeHead(HTTP_CODE.OK);
              res.write(
                JSON.stringify({
                  message: `User ${likeData.target} has been unliked`,
                })
              );
              res.end();
            } else {
              res.writeHead(HTTP_CODE.InternalServerError);
              res.write(`User ${likeData.target} could not be unliked`);
              res.end();
            }
          });
        } else {
          res.writeHead(HTTP_CODE.Conflict);
          res.write(
            JSON.stringify({
              message: `User ${likeData.target} cannot be unliked`,
            })
          );
          res.end();
        }
      });
    } catch (error) {
      res.writeHead(HTTP_CODE.InternalServerError);
      res.write(JSON.stringify(error));
      res.end();
    }
  };

  getLogedUser = (req: any, res: http.ServerResponse): void => {
    if (req.user) {
      User.findOne({ _id: req.user }, function (err: any, user: any) {
        res.writeHead(HTTP_CODE.OK);
        if (!user) {
          res.write(
            JSON.stringify({ message: `user ${req.user} could not be found` })
          );
        } else {
          res.write(JSON.stringify(user));
        }
        res.end();
      });
    } else {
      res.writeHead(HTTP_CODE.Unauthorized);
      res.end();
    }
  };

  noResponse = (req: any, res: any) => {
    fs.readFile("./src/404.html", "utf8", (error, content) => {
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(content, "utf-8");
    });
  };
}
