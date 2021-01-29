// import mongoose, { Schema } from 'mongoose';

// const user = new Schema({
//     emri: String,
//     mbiemri: String,
//     image: String,
//     email:String,
//     likesCount: Number,
//     dislikesCount: Number,
//     createdAt: { type:Date,  default:Date.now },
//     updatedAt: { type:Date,  default:Date.now },
// }, { collection: "user" });

// export default mongoose.model("users", user);


import { Model, model, Schema, Document } from 'mongoose';
import { IUser } from '../model/user';

const UserSchema = new Schema({
    emri: String,
    mbiemri: String,
    image: String,
    email:String,
    likesCount: Number,
    dislikesCount: Number,
    createdAt: { type:Date,  default:Date.now },
    updatedAt: { type:Date,  default:Date.now },
}, { collection: "user" });

export interface IUserInterface extends IUser, Document {

}

export interface UserModel extends Model<IUserInterface> {
    getUserId(userEmail: string): Promise<string>
}

UserSchema.statics.getUserId = function (userEmail: string) {
    return new Promise((resolve, reject) => {
        this.findOne({email: userEmail}, (err: string, doc: IUserInterface) => {
            if (err) {
                reject(err);
            } else {
                resolve(doc._id)
            }
        })
    })
}

export const User: UserModel = model<IUserInterface, UserModel>('User', UserSchema);