import http from 'http';
import users from "../db/user";
import { Like } from "../db/likes";
import { HTTP_CODE } from '../enums/http-status-codes';
import { IUser } from "../model/user";
import { ILike } from '../model/like';
import { PassportDB } from '../db/passport';

export class HttpRequestHandlers {

    getUsers = (req: http.ClientRequest, res: http.ServerResponse): void => {
        console.log('getting users here')
        users.find({}, (err: string, result: IUser) => {
            if (err) {
                res.writeHead(HTTP_CODE.OK);
                res.write(JSON.stringify(err));
                res.end();
            } else {
                res.writeHead(HTTP_CODE.OK);
                res.write(JSON.stringify(result));
                res.end();
            }
        })
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
                                users.findOneAndUpdate({ _id: likeData.target }, { $inc: { 'likesCount': 1 } }).exec();
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
}