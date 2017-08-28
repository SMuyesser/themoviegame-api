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


describe('Auth endpoints', function() {
  const playername = 'examplePlayer';
  const password = 'examplePass';
  const email = 'exampleemail@email.com';
  const scores = [{start: 'mov1', end: 'mov2', links: 3}];

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
        email,
        scores
      })
    );
  });

  afterEach(function() {
    return Player.remove({});
  });

  describe('/auth/login', function() {
    it('Should reject requests with no credentials', function() {
      return chai.request(app)
        .post('/auth/login')
        .then(() => expect.fail(null, null, 'Request should not succeed'))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with incorrect usernames', function() {
      return chai.request(app)
        .post('/auth/login')
        .auth('wrongUsername', password)
        .then(() => expect.fail(null, null, 'Request should not succeed'))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should reject requests with incorrect passwords', function() {
      return chai.request(app)
        .post('/auth/login')
        .auth(playername, 'wrongPassword')
        .then(() => expect.fail(null, null, 'Request should not succeed'))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(401);
        });
    });
    it('Should return a valid auth token', function() {
      return chai.request(app)
        .post('/auth/login')
        .auth(playername, password)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm:  ["HS256"]
          });
          expect(payload.player.playername).to.equal(playername);
          expect(payload.player.email).to.equal(email);
          expect(payload.player.scores.start).to.equal(scores.start);
          expect(payload.player.scores.end).to.equal(scores.end);
          expect(payload.player.scores.links).to.equal(scores.links);
        })
    });
  });

  describe('/auth/refresh', function() {
    it('Should reject requests with no credentials', function() {
      return chai.request(app)
        .post('/auth/refresh')
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
        .post('/auth/refresh')
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
        .post('/auth/refresh')
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
    it('Should return a valid auth token with a newer expiry date', function() {
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
      const decoded = jwt.decode(token);

      return chai.request(app)
        .post('/auth/refresh')
        .set('authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          const token = res.body.authToken;
          expect(token).to.be.a('string');
          const payload = jwt.verify(token, JWT_SECRET, {
            algorithm:  ["HS256"]
          });
          expect(payload.player).to.deep.equal({
            playername,
            email
          });
          expect(payload.exp).to.be.at.least(decoded.exp);
        });
    });
  });
});
