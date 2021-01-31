import { Model, model, Schema, Document } from "mongoose";
import { IUser } from "../model/user";

const UserSchema = new Schema(
  {
    emri: String,
    mbiemri: String,
    image: String,
    email: String,
    likesCount: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "user" }
);

export interface IUserInterface extends IUser, Document {}

export interface UserModel extends Model<IUserInterface> {
  getUserId(userEmail: string): Promise<string>;
  updateuser(user: IUser, userId: string): Promise<any>;
  createUser(user: IUser): Promise<any>;
}

UserSchema.statics.createUser = function (user: IUser) {
  return new Promise((resolve, reject) => {
    this.create(user, function (err: any, doc: any) {
      if (!doc) {
        reject(err);
      } else {
        resolve(doc);
      }
    });
  });
};

UserSchema.statics.getUserId = function (userEmail: string) {
  return new Promise((resolve, reject) => {
    this.findOne({ email: userEmail }, function (err: any, doc: any) {
      if (!doc) {
        reject(err);
      } else {
        resolve(doc._id);
      }
    });
  });
};

UserSchema.statics.updateuser = function (user: IUser, userId: string) {
  return new Promise((resolve, reject) => {
    this.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          emri: user.emri,
          mbiemri: user.mbiemri,
          image: user.image,
        },
      }
    ).exec(function (err: any, res: any) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
};

export const User: UserModel = model<IUserInterface, UserModel>(
  "User",
  UserSchema
);
