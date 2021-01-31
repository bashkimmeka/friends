process.env.NODE_ENV = 'test';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { HTTP_CODE } from '../src/enums/http-status-codes';
import { get as getConfig } from 'config';
import { User } from '../src/db/user';
chai.should();
chai.use(chaiHttp);

const apiUrl = `${getConfig('apiUrl')}:${getConfig('port')}`

describe('USERS', () => {
  let user1Id: string
  before((done) => {
    User.getUserId('test.1@gmail.com').then((userId: string) => {
      user1Id = userId;
      done();
    })
  })

  describe('HAPPY: User data', () => {
    it('Should return user data', (done) => {
      chai.request(apiUrl)
        .get('/user/'+user1Id)
        .end((err, res) => {
          res.should.have.status(HTTP_CODE.OK);
          res.body.should.haveOwnProperty('likes');
          res.body.should.haveOwnProperty('username')
          done();
        });
    });
  });
});