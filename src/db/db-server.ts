import mongoose from "mongoose";
import { get as getConfig } from 'config';
export class DBServer {
    connect = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            mongoose.set('useNewUrlParser', true);
            mongoose.set('useFindAndModify', false);
            mongoose.set('useCreateIndex', true);
            mongoose.connect(getConfig('mongo_uri'), {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useFindAndModify: false
            }).then(() => {
                resolve("Connected to mongoDB");
            }).catch(err => {
                reject(err);
            });
        })
    }
}