import chai from 'chai';
import chaiHttp from 'chai-http';
import { HTTP_CODE } from '../src/enums/http-status-codes';
import { get as getConfig } from 'config';
import { User } from '../src/db/user';
chai.should();
chai.use(chaiHttp);

const apiUrl = `${getConfig('apiUrl')}:${getConfig('port')}`
describe('LIKES', () => {
    let user1Token: string
    let user2Id: string

    before((done) => {
        chai.request(apiUrl)
            .post('/login')
            .send({
                "email": "test.1@gmail.com",
                "password": "test"
            })
            .end(function (err, res) {
                user1Token = res.body.token
                User.getUserId('test.2@gmail.com').then(userId => {
                    user2Id = userId
                    done()
                })
            });
    });

    describe('HAPPY: Be able to like a user', () => {
        it('Should like a user', (done) => {
            chai.request(apiUrl)
            .post('/user/'+user2Id+'/like')
            .set({ 'Authorization': 'JWT ' + user1Token })
            .end((err, res) => {
              res.should.have.status(HTTP_CODE.OK);
              done();
            });
        })
    })

    describe('SAD: Not to be able to like a previously liked user', () => {
        it('Should not like a user', (done) => {
            chai.request(apiUrl)
            .post('/user/'+user2Id+'/like')
            .set({ 'Authorization': 'JWT ' + user1Token })
            .end((err, res) => {
              res.should.have.status(HTTP_CODE.Conflict);
              done();
            });
        })
    })

    describe('HAPPY: Get most liked user list', () => {
        it('Should get the most liked users list', (done) => {
          chai.request(apiUrl)
            .get('/most-liked')
            .set({ 'Authorization': 'JWT ' + user1Token })
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body[0].likesCount.should.be.eql(1);
              res.body[1].likesCount.should.be.eql(0);
              res.body.length.should.be.eql(2);
              done();
            });
        });
      });

      describe('HAPPY: Be able to unlike a user', () => {
        it('Should ulike a user', (done) => {
            chai.request(apiUrl)
            .post('/user/'+user2Id+'/unlike')
            .set({ 'Authorization': 'JWT ' + user1Token })
            .end((err, res) => {
              res.should.have.status(HTTP_CODE.OK);
              res.body.message.should.eql(`User ${user2Id} has been unliked`)
              done();
            });
        })
    })


})