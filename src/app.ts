import http from 'http';
import fs from 'fs'
import mongoose from "mongoose";
import users from "./db/user"
import { IUser } from "./model/user";
import { HttpRequestHandlers } from './http-middleware/request-handlers';
import { HTTP_CODE } from './enums/http-status-codes';
import { get as getConfig } from 'config';

const getHandler = (req: http.ClientRequest, res: http.ServerResponse, reqUrl: string) => {
    console.log('getting data', reqUrl)
    users.find({}, (err: string, result: IUser) => {
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
        users.create(JSON.parse(chunk), (err: any, result: any) => {
            if(err){
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

const noResponse = (req: any, res: any) => {
    fs.readFile('./src/404.html', 'utf8', (error, content) => {
        console.log('responding to not found', error)
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(content, 'utf-8');
    });
}

mongoose.connect(getConfig('mongo_uri'), { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false });

const connection = mongoose.connection;

connection.once("open", function () {
  console.log("MongoDB database connection established successfully");
});

http.createServer((req: any, res: any) => {
    const httpRequestHandlers = new HttpRequestHandlers()
    const router: any = {
        'GET/retrieve-data': httpRequestHandlers.getUsers,
        'POST/send-data': postHandler,
        'POST/create-like': httpRequestHandlers.postLike,
        'default': noResponse
    };
    const reqUrl = new URL(req.url, 'http://127.0.0.1/');
    const redirectedFunc = router[req.method + reqUrl.pathname] || router['default'];
    redirectedFunc(req, res, reqUrl);
}).listen(getConfig('port'), () => {
    console.log(`Server is running at http://127.0.0.1:/${getConfig('port')}`);
});