process.env.NODE_ENV = 'test';
import chai from 'chai';
import chaiHttp from 'chai-http';
import { HTTP_CODE } from '../src/enums/http-status-codes';
import { get as getConfig } from 'config';
import { Token } from '../src/db/token';
chai.should();
chai.use(chaiHttp);

const apiUrl = `${getConfig('apiUrl')}:${getConfig('port')}`

describe('RESET PASSWORD', () => {
    let resetPasswordToken: string
    describe('HAPPY: Request password reset', () => {
        it('Should generate password reset token', (done) => {
            chai.request(apiUrl)
                .post('/me/request-reset-password')
                .send({
                    'email': 'test.2@gmail.com'
                }).end((err, res) => {
                    res.should.have.status(HTTP_CODE.OK);
                    res.body.should.haveOwnProperty('message');
                    res.body.message.should.eql('an email with reset password instructions has been sent to: test.2@gmail.com');
                    done();
                })
        })
    })

    describe('HAPPY: Reset password with token', () => {
        before((done) => {
            Token.find({}).exec((err: string, docs: any) => {
                resetPasswordToken = docs[0].token;
                done()
            })
        });

        it('Should update password', (done) => {
            chai.request(apiUrl)
                .post('/me/update-token-password')
                .send({
                    'token': resetPasswordToken,
                    'password': 'newpassword'
                }).end((err, res) => {
                    res.should.have.status(HTTP_CODE.OK);
                    res.body.should.haveOwnProperty('message');
                    res.body.message.should.eql('your password has been updated successfully!')
                    done();
                })
        })
    })

    describe('HAPPY: Update current user password', () => {
        let user1Token: string
        before((done) => {
            chai.request(apiUrl)
                .post('/login')
                .send({
                    "email": "test.1@gmail.com",
                    "password": "test"
                })
                .end(function (err, res) {
                    user1Token = res.body.token
                    done()
                });
        })

        it('Should update current user password', (done) => {
            chai.request(apiUrl)
                .post('/me/update-password')
                .set({ 'Authorization': 'JWT ' + user1Token })
                .send({
                    'password': 'newpassword'
                }).end((err, res) => {
                    res.should.have.status(HTTP_CODE.OK);
                    res.body.should.haveOwnProperty('message');
                    res.body.message.should.eql('your password has been updated successfully!')
                    done();
                })
        })
    })

    describe('HAPPY: Login with new password', () => {
        it('Should be able to login with the new password', (done) => {
            chai.request(apiUrl)
                .post('/login')
                .send({
                    'email': 'test.1@gmail.com',
                    'password': 'newpassword'
                }).end((err, res) => {
                    res.should.have.status(HTTP_CODE.OK);
                    res.body.should.haveOwnProperty('token');
                    done();
                })
        })
    })

    describe('SAD: Canot update users password', () => {
        it('Should not be able to update users password when not authenticated', (done) => {
            chai.request(apiUrl)
                .post('/me/update-password')
                .send({
                    'password': 'newpassword'
                }).end((err, res) => {
                    res.should.have.status(HTTP_CODE.Unauthorized);
                    res.body.should.haveOwnProperty('message');
                    res.body.message.should.eql('unauthorized')
                    done();
                })
        })
    })
})