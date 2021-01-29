
import { Model, model, Schema, Document } from 'mongoose';
import { IToken } from '../model/token';

const TokenSchema = new Schema({
    token: String,
    type: String,
    expire: Date,
    createdAt: { type: Date, expires: '24h', default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { collection: "token" });

export interface ITokenInterface extends IToken, Document {

}

export interface TokenModel extends Model<ITokenInterface> {
    validateToken(token: string): Promise<boolean>,
    saveToken(token: IToken): Promise<IToken>
}

TokenSchema.statics.saveToken = function (token: IToken) {
    return new Promise((resolve, reject) => {
        this.create(token, (err, doc) => {
            if (err) {
                reject(err);
            } else {
                resolve(doc)
            }
        })
    })
}

TokenSchema.statics.validateToken = function (token: IToken) {
    return new Promise((resolve) => {
        this.findOne({ 'token': token }).exec((err: string, result: IToken) => {
            if (err) {
                resolve(false)
            }
            else {
                const date = new Date();
                if(result.expire.getTime() < date.getTime()){
                    console.log('token is valid');
                    resolve(false)
                } else {
                    console.log('token is invalid')
                    resolve(true)
                }   
            }
        })
    })
}

export const Token: TokenModel = model<ITokenInterface, TokenModel>('Token', TokenSchema);