global.DATABASE_URL = 'mongodb://localhost/themoviegamedb-test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');

const {app, runServer, closeServer} = require('../server');
const {Player} = require('../routes/players');
const {JWT_SECRET} = require('../config');

const expect = chai.expect;


// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);


describe('Protected endpoint', function() {
  const playername = 'examplePlayer';
  const password = 'examplePass';
  const email = 'exampleemail@email.com';

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() {
    return Player.hashPassword(password).then(password =>
      Player.create({
        playername,
        password,
        email
      })
    );
  });

  afterEach(function() {
    return Player.remove({});
  });

  describe('/protected', function() {
    it('Should reject requests with no credentials', function() {
      return chai.request(app)
        .get('/protected')
        .then(() => expect.fail(null, null, 'Request should not succeed'))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });

    it('Should reject requests with an invalid token', function() {
      const token = jwt.sign({
        playername,
        email
      }, 'wrongSecret', {
        algorithm: 'HS256',
        expiresIn: '7d'
      });

      return chai.request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`)
        .then(() => expect.fail(null, null, 'Request should not succeed'))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with an expired token', function() {
      const token = jwt.sign({
        player: {
          playername,
          email
        },
        exp: Math.floor(Date.now() / 1000) - 10 // Expired ten seconds ago
      }, JWT_SECRET, {
        algorithm: 'HS256',
        subject: playername
      });

      return chai.request(app)
        .get('/protected')
        .set('authorization', `Bearer ${token}`)
        .then(() => expect.fail(null, null, 'Request should not succeed'))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should send protected data', function() {
      const token = jwt.sign({
        player: {
          playername,
          email
        },
      }, JWT_SECRET, {
        algorithm: 'HS256',
        subject: playername,
        expiresIn: '7d'
      });

      return chai.request(app)
        .get('/protected')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body.data).to.equal('rosebud');
        });
    });
  });
});
