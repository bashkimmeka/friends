
import chai from 'chai';
import chaiHttp from 'chai-http';
import { HTTP_CODE } from '../src/enums/http-status-codes';
import { get as getConfig } from 'config';
chai.should();
chai.use(chaiHttp);
const apiUrl = `${getConfig('apiUrl')}:${getConfig('port')}`

describe('SIGN UP', () => {
    describe('HAPPY: POST signup', () => {
        it('It should signup user', (done) => {
          chai.request(apiUrl)
            .post('/signup')
            .send({
              "user": {
                "emri": "Bashkim",
                "mbiemri": "Meka",
                "email": "bashkim.meka@gmail.com",
                "imazhi": "img.png"
              },
              "password": "test"
            })
            .end((err, res) => {
              res.should.have.status(HTTP_CODE.OK);
              done();
            });
        });
      });
    
      describe('SAD: POST signup', () => {
        it('It should return conflict when trying to signup with existing email', (done) => {
          chai.request(apiUrl)
            .post('/signup')
            .send({
              "user": {
                "emri": "Bashkim",
                "mbiemri": "Meka",
                "email": "bashkim.meka@gmail.com",
                "imazhi": "img.png"
              },
              "password": "test"
            })
            .end((err, res) => {
              res.should.have.status(HTTP_CODE.Conflict);
              done();
            });
        });
      });
})