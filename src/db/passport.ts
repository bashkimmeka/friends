
import bcrypt from 'bcrypt';
import { model, Schema, Model, Document } from 'mongoose';
import { IPassport } from '../model/passport';

const PassportSchema = new Schema({
    password: String,
    userId: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { collection: "passport" });

export interface IPassportInterface extends IPassport, Document {

}
export interface PassportModel extends Model<IPassportInterface> {
    createPassport(password: string, userId: string): Promise<any>,
    updatePassword(userId: string, newPassword: string): Promise<any>,
    getPassword(userId: string): Promise<string>
}

PassportSchema.statics.updatePassword = function (userId: string, newPassword: string) {
    return new Promise((resolve, reject) => {
        const salt = bcrypt.genSaltSync(10);
        const newPasswordHashed = bcrypt.hashSync(newPassword, salt)
        this.findOneAndUpdate({ 'userId': userId },
            { $set: { 'password': newPasswordHashed } })
            .exec(function (err: any, res: any) {
                if(err){
                    reject(err);
                } else {
                    resolve(res)
                }
            })
    })
}

PassportSchema.statics.getPassword = function(userId: string) {
    return new Promise((resolve, reject) => {
        this.findOne({ 'userId': userId }).exec((err: string, pwd: IPassportInterface) => {
            if(err) {
                reject('user not found');
            } else {
                resolve(pwd.password);
            }
        })
    })
}

PassportSchema.statics.createPassport = function (password, userId) {
    console.log('user: ' + userId)
    console.log('password: ' + password)
    const salt = bcrypt.genSaltSync(10);
    return this.create({
        password: bcrypt.hashSync(password, salt),
        userId
    })
}
export const PassportDB: PassportModel = model<IPassportInterface, PassportModel>('passport', PassportSchema);
//export default model<PassportModel>("passport", PassportSchema);