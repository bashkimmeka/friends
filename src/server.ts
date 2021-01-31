import http from "http";
import domain from "domain";
import { get as getConfig } from "config";
import { ReqUrlMiddleware } from "./http-middleware/req-url-middleware";

export class Server {
  start = (): Promise<any> => {
    const serverDomain = domain.create();
    return new Promise((resolve) => {
      serverDomain.run(() => {
        if (getConfig("app_secret") !== "") {
          http
            .createServer((req: any, res: any) => {
              const reqd = domain.create();
              reqd.add(req);
              reqd.add(res);
              reqd.on("error", (er) => {
                console.error("Error", er, req.url);
                try {
                  res.writeHead(500);
                  res.end("Error occurred: " + er);
                } catch (er2) {
                  console.error("Error sending 500", er2, req.url);
                }
              });
              res.setHeader("Content-Type", "application/json");
              const reqUrl = new URL(req.url, "http://127.0.0.1/");
              const reqUrlMiddleware = new ReqUrlMiddleware();
              reqUrlMiddleware.handleRequest(req, res, reqUrl);
            })
            .listen(getConfig("port"), () => {
              resolve(
                `Server is running at http://127.0.0.1:${getConfig("port")}`
              );
            });
        } else {
          console.log("app_secret missing in config");
          throw new Error("app_secret missing in config");
        }
      });
    });
  };
}
