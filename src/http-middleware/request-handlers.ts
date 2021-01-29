/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import http, { ClientRequest } from 'http';
import fs from 'fs'
import { User } from "../db/user";
import { Like } from "../db/likes";
import { HTTP_CODE } from '../enums/http-status-codes';
import { IUser } from "../model/user";
import { ILike } from '../model/like';
import { PassportDB } from '../db/passport';
import { TokenService } from '../services/tokenService';
import { Token } from '../db/token';
import { IToken } from '../model/token';
import { PasswordService } from '../services/passwordService';

export class HttpRequestHandlers {

    getUsers = (req: any, res: any, reqUrl: any): void => {
        console.log('user', req.user)
        User.find().sort([['likesCount', -1]]).exec(function (err: string, docs: IUser[]) {
            if (err) {
                res.writeHead(HTTP_CODE.OK, { 'Content-Type': 'application/json' });
                res.write(JSON.stringify(err));
                res.end();
            } else {
                res.writeHead(HTTP_CODE.OK);
                res.write(JSON.stringify(docs));
                res.end();
            }
        });
    }

    signup = (req: http.ClientRequest, res: http.ServerResponse, reqUrl: any): void => {
        req.on('data', (data: any) => {
            const dataObj: any = JSON.parse(data);
            console.log(JSON.parse(data))
            User.create(JSON.parse(data).user, (err: any, result: any) => {
                if (err) {
                    console.log('error here', err)
                    res.writeHead(500);
                    res.write(JSON.stringify(err));
                    res.end();
                } else {
                    PassportDB.createPassport(dataObj.password, result._id).then(passRes => {
                        if (passRes) {
                            res.writeHead(200);
                            res.write('User created: ' + result);
                            res.end();
                        } else {
                            res.writeHead(500);
                            res.write("A problem ocurred while creating user password");
                            res.end();
                        }
                    })
                }
            })
        });
    }

    login = (req: http.ClientRequest, res: http.ServerResponse, reqUrl: any): void => {
        req.on('data', (data: any) => {
            const loginData: any = JSON.parse(data);
            const tokenService = new TokenService();
            const passwordService = new PasswordService();
            User.getUserId(loginData.email).then((userId: string) => {
                PassportDB.getPassword(userId).then((pwd: string) => {
                    passwordService.isCorrect(loginData.password, pwd).then((result) => {
                        console.log('password is correct', result);
                        const token = tokenService.generateLoginToken(userId);
                        tokenService.verifyToken(token).then((decodedToken) => {
                            res.writeHead(HTTP_CODE.OK);
                            res.write(JSON.stringify({
                                token: token,
                                exp: decodedToken.exp
                            }));
                            res.end();
                        })
                      
                    }).catch((err) => {
                        res.writeHead(HTTP_CODE.Forbidden);
                        res.write(err);
                        res.end();
                    })
                }).catch(() => {
                    res.writeHead(HTTP_CODE.Forbidden);
                    res.write("wrong username or password");
                    res.end();
                });
            }).catch((err) => {
                res.writeHead(500);
                res.write("User not found: " + err);
                res.end();
            })
        });
    }

    requestPasswordReset = (req: http.ClientRequest, res: http.ServerResponse, reqUrl: any): void => {
        req.on('data', (data: any) => {
            const dataObj: any = JSON.parse(data);
            const tokenService = new TokenService();
            const generatedToken = tokenService.generatePasswordResetToken(dataObj.email)
            const date = new Date()
            const tokenObj: IToken = {
                token: generatedToken,
                type: 'password-reset',
                expire: new Date(date.setHours(date.getHours() + 24)),
                createdAt: new Date(),
                updatedAt: new Date()
            }
            Token.saveToken(tokenObj).then((savedToken: IToken) => {
                res.writeHead(200);
                res.write(JSON.stringify(savedToken));
                res.end();
            }).catch((err) => {
                res.writeHead(500);
                res.write(err);
                res.end();
            });
        });
    }

    resetPassword = (req: http.ClientRequest, res: http.ServerResponse): void => {
        req.on('data', (data: any) => {
            const dataObj: any = JSON.parse(data);
            const tokenService = new TokenService();
            tokenService.verifyToken(dataObj.token).then(result => {
                console.log('result of the token', result)
                Token.validateToken(dataObj.token).then((isValid) => {
                    if (isValid) {
                        User.getUserId(result.email).then((userID) => {
                            PassportDB.updatePassword(userID, dataObj.password).then((result) => {
                                res.writeHead(200);
                                res.write(JSON.stringify(result));
                                res.end();
                            }).catch((err) => {
                                res.writeHead(500);
                                res.write(err);
                                res.end();
                            })
                        }).catch((err) => {
                            res.writeHead(500);
                            res.write(err);
                            res.end();
                        })
                    } else {
                        res.writeHead(HTTP_CODE.Forbidden);
                        res.write('invalid or expired token');
                        res.end();
                    }
                })
            }).catch(err => {
                res.writeHead(HTTP_CODE.Forbidden);
                res.write('invalid token: ' + err);
                res.end();
            });
        });
    }

    postLike = (req: http.ClientRequest, res: http.ServerResponse): void => {
        req.on('data', (data: any) => {
            const likeData: ILike = JSON.parse(data)
            try {
                Like.hasLikedUser(likeData).then((result) => {
                    if (result) {
                        console.log('it exists')
                        Like.existingLikeUnlike(likeData).then((saved) => {
                            if (saved) {
                                res.writeHead(HTTP_CODE.OK);
                                res.write(`User ${likeData.target} has been liked`);
                                res.end();
                            } else {
                                res.writeHead(HTTP_CODE.InternalServerError);
                                res.write(`User ${likeData.target} could not be liked/unliked`);
                                res.end();
                            }
                        })
                    } else {
                        Like.create(likeData, (createErr: any, result: any) => {
                            if (createErr) {
                                res.writeHead(500);
                                res.write(JSON.stringify(createErr));
                                res.end();
                            } else {
                                User.findOneAndUpdate({ _id: likeData.target }, { $inc: { 'likesCount': 1 } }).exec();
                                res.writeHead(200);
                                res.write(JSON.stringify(result));
                                res.end();
                            }
                        })
                    }
                })
            } catch (error) {
                res.writeHead(500);
                res.write(JSON.stringify(error));
                res.end();
            }
        });
    }

    noResponse = (req: any, res: any) => {
        fs.readFile('./src/404.html', 'utf8', (error, content) => {
            console.log('responding to not found', error)
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
        });
    }
}