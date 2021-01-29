
import { HttpRequestHandlers } from "./request-handlers";

export class Router {
    httpRequestHandlers: HttpRequestHandlers = new HttpRequestHandlers();
    public routes: any = {
        'GET/users': {
            controller: this.httpRequestHandlers.getUsers,
            authorized: true
        },
        'POST/signup': {
            controller: this.httpRequestHandlers.signup,
            authorized: true
        },
        'POST/login': {
            controller: this.httpRequestHandlers.login,
            authorized: false
        },
        'POST/requestpasswordreset': {
            controller: this.httpRequestHandlers.requestPasswordReset,
            authorized: true
        },
        'POST/resetpassword': {
            controller: this.httpRequestHandlers.resetPassword,
            authorized: true
        },
        'POST/create-like': {
            controller: this.httpRequestHandlers.postLike,
            authorized: true
        },
        'default': {
            controller: this.httpRequestHandlers.noResponse,
            authorized: false 
        },
    }
}