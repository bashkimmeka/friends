import http from 'http';
import fs from 'fs'
import mongoose from "mongoose";
import { User } from "./db/user"
import { IUser } from "./model/user";
import { HTTP_CODE } from './enums/http-status-codes';
import { get as getConfig } from 'config';
import domain from 'domain';
import { Router } from './http-middleware/router';
import { AuthMiddleware } from './http-middleware/auth-middleware';

const getHandler = (req: http.ClientRequest, res: http.ServerResponse, reqUrl: string) => {
    console.log('getting data', reqUrl)
    User.find({}, (err: string, result: IUser) => {
        console.log(result)
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


const postHandler = (req: any, res: any, reqUrl: any) => {
    req.setEncoding('utf8');
    req.on('data', (chunk: any) => {
        console.log(JSON.parse(chunk))
        User.create(JSON.parse(chunk), (err: any, result: any) => {
            if (err) {
                console.log('error here', err)
                res.writeHead(500);
                res.write(JSON.stringify(err));
                res.end();
            } else {
                res.writeHead(200);
                res.write('User created: ' + result);
                res.end();
            }
        })

    });
}

mongoose.connect(getConfig('mongo_uri'), { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });

const connection = mongoose.connection;

connection.once("open", function () {
    console.log("MongoDB database connection established successfully");
});


const serverDomain = domain.create();

serverDomain.run(() => {
    http.createServer((req: any, res: any) => {
        const reqd = domain.create();
        reqd.add(req);
        reqd.add(res);
        reqd.on('error', (er) => {
            console.error('Error', er, req.url);
            try {
                res.writeHead(500);
                res.end('Error occurred: '+ er);
            } catch (er2) {
                console.error('Error sending 500', er2, req.url);
            }
        });
        res.setHeader('Content-Type', 'application/json');
        const router = new Router();
        const auth = new AuthMiddleware();
        const reqUrl = new URL(req.url, 'http://127.0.0.1/');
        const redirectedFunc = router.routes[req.method + reqUrl.pathname].controller || router.routes['default'];
        const authorized = router.routes[req.method + reqUrl.pathname].authorized
        auth.handleRequest(req, res, reqUrl, authorized, redirectedFunc);
    }).listen(getConfig('port'), () => {
        console.log(`Server is running at http://127.0.0.1:/${getConfig('port')}`);
    });
});