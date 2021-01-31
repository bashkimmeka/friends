
import { HttpRequestHandlers } from "./request-handlers";

export class Router {
    httpRequestHandlers: HttpRequestHandlers = new HttpRequestHandlers();
    public routes: any = {
        'GET/user/:id': {
            controller: this.httpRequestHandlers.getuser,
            authorized: false
        },
        'GET/most-liked': {
            controller: this.httpRequestHandlers.getMostLikedUsers,
            authorized: false
        },
        'PUT/user': {
            controller: this.httpRequestHandlers.updateUser,
            authorized: true
        },
        'POST/signup': {
            controller: this.httpRequestHandlers.signup,
            authorized: false
        },
        'POST/login': {
            controller: this.httpRequestHandlers.login,
            authorized: false
        },
        'GET/me': {
            controller: this.httpRequestHandlers.getLogedUser,
            authorized: true
        },
        'POST/me/request-reset-password': {
            controller: this.httpRequestHandlers.requestPasswordReset,
            authorized: false
        },
        'POST/me/update-token-password': {
            controller: this.httpRequestHandlers.resetPassword,
            authorized: false
        },
        'POST/me/update-password': {
            controller: this.httpRequestHandlers.resetCurrentUserPassword,
            authorized: true
        },
        'POST/user/:id/like': {
            controller: this.httpRequestHandlers.likeUser,
            authorized: true
        },
        'POST/user/:id/unlike': {
            controller: this.httpRequestHandlers.unlikeUser,
            authorized: true
        },
        'default': {
            controller: this.httpRequestHandlers.noResponse,
            authorized: false 
        },
    }
}