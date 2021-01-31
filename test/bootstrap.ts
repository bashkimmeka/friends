import { DBServer } from "../src/db/db-server";
import { User } from "../src/db/user";
import { Like } from "../src/db/likes";
import { Passport } from "../src/db/passport";
import { Token } from "../src/db/token";
import { Server } from "../src/server";
import { IUser } from "../src/model/user";

const dbServer = new DBServer();
const server = new Server();

const testUser1: IUser = {
  emri: "tetuser1",
  mbiemri: "testuser1",
  email: "test.1@gmail.com",
  image: "img1.png",
  likesCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const testUser2: IUser = {
  emri: "tetuser2",
  mbiemri: "testuser2",
  email: "test.2@gmail.com",
  image: "img2.png",
  likesCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
};

before((done) => {
  dbServer.connect().then(async (msg) => {
    console.log("\x1b[32m", `${msg}\n`);
    await Like.deleteMany({}, {});
    await Passport.deleteMany({}, {});
    await Token.deleteMany({}, {});
    await User.deleteMany({}, {});

    await User.createUser(testUser1).then(async (result: any) => {
      await Passport.createPassport("test", result._id);
    });

    await User.createUser(testUser2).then(async (result: any) => {
      await Passport.createPassport("test", result._id);
    });
    console.log("\x1b[32m", "√ \x1b[0m" + "Fixtures\n");
    server.start().then((info) => {
      console.log("\x1b[32m", `${info}\n`);
      done();
    });
  });
});

after((done) => {
  console.log("all done");
  done();
});
