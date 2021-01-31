import { Router } from './router';
import { AuthMiddleware } from './auth-middleware';

export class ReqUrlMiddleware {
    handleRequest = (req: any, res: any, reqUrl: any): void => {
        const router = new Router();
        const auth = new AuthMiddleware();
        const mongoId = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;
        let urlPath = reqUrl.pathname;
        const pathParts = reqUrl.pathname.split('/')
        if(pathParts.length > 1){
            for (let i = 0; i < pathParts.length; i++) {
                const result = mongoId.test(pathParts[i])
                if (result){
                    urlPath = urlPath.replace(pathParts[i], ':id');
                    req.id = pathParts[i]; 
                    break;
                }
            }    
        }
       
        const route = router.routes[req.method + urlPath] || router.routes['default'];
        auth.handleRequest(req, res, reqUrl, route.authorized, route.controller);
    }
}