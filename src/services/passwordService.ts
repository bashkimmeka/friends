import bcrypt from "bcrypt";
export class PasswordService {
  isCorrect = (password: string, hashed: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hashed, function (err, result) {
        if (result) {
          resolve(result);
        } else {
          reject("incorrect username or password");
        }
      });
    });
  };
}
