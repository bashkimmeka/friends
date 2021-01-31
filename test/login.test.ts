import chai from 'chai';
import chaiHttp from 'chai-http';
import { HTTP_CODE } from '../src/enums/http-status-codes';
import { get as getConfig } from 'config';
chai.should();
chai.use(chaiHttp);

const apiUrl = `${getConfig('apiUrl')}:${getConfig('port')}`

describe('LOGIN', () => {

    describe('HAPPY: Login', () => {
        it('Should login successfully with valid credentials', (done) => {
            chai.request(apiUrl)
                .post('/login')
                .send({
                    'email': 'test.1@gmail.com',
                    'password': 'test'
                }).end((err, res) => {
                    res.should.have.status(HTTP_CODE.OK);
                    res.body.should.haveOwnProperty('token');
                    done();
                })
        })
    })

    describe('SAD: Login', () => {
        it('Should not login with invalid credentials', (done) => {
            chai.request(apiUrl)
                .post('/login')
                .send({
                    'email': 'test.1@gmail.com',
                    'password': 'wrong_password'
                }).end((err, res) => {
                    res.should.have.status(HTTP_CODE.Forbidden);
                    res.body.message.should.eql('incorrect username or password');
                    done();
                })
        })
    })

})

describe('ME', () => {
    describe('HAPPY: Logged in User data', () => {
        let loggedUserToken: string
        before((done) => {
            chai.request(apiUrl)
            .post('/login')
            .send({
                'email': 'test.1@gmail.com',
                'password': 'test'
            }).end((err, res) => {
                res.should.have.status(HTTP_CODE.OK);
                loggedUserToken = res.body.token
                done();
            })
        }) 
        it('Should return logged in user data', (done) => {
            chai.request(apiUrl)
                .get('/me')
                .set({ 'Authorization': 'JWT ' + loggedUserToken })
                .send({
                    'email': 'test.1@gmail.com',
                    'password': 'wrong_password'
                }).end((err, res) => {
                    res.should.have.status(HTTP_CODE.OK);
                    res.body.email.should.eql('test.1@gmail.com');
                    done();
                })
        })
    })

    describe('SAD: Logged user data without being authenticated', () => {
        it('Should not return user data when user is not authenticated', (done) => {
            chai.request(apiUrl)
                .get('/me')
                .send({
                    'email': 'test.1@gmail.com',
                    'password': 'wrong_password'
                }).end((err, res) => {
                    res.should.have.status(HTTP_CODE.Unauthorized);
                    done();
                })
        })
    })


    describe('SAD: Logged user data with invalid token ', () => {
        it('Should not return user data when user has an invalid token', (done) => {
            chai.request(apiUrl)
                .get('/me')
                .set({ 'Authorization': 'JWT invalidtoken' })
                .send({
                    'email': 'test.1@gmail.com',
                    'password': 'wrong_password'
                }).end((err, res) => {
                    res.should.have.status(HTTP_CODE.Unauthorized);
                    done();
                })
        })
    })
})