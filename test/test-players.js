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


describe('/players', function() {
  const playername = 'exampleUser';
  const password = 'examplePass';
  const email = 'Example@email.com';
  const scores = [{start: 'mov1', end: 'mov2', links: 3}]
  const playernameB = 'exampleUserB';
  const passwordB = 'examplePassB';
  const emailB = 'ExampleB@email.com';
  const scoresB = [{start: 'mov3', end: 'mov4', links: 7}]


  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  beforeEach(function() {
  });

  afterEach(function() {
    return Player.remove({});
  });

  describe('/players', function() {
    describe('POST', function() {
      it('Should reject players with missing playername', function() {
        return chai.request(app)
          .post('/players')
          .send({
            password,
            email
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('playername');
          });
      });
      it('Should reject players with missing password', function() {
        return chai.request(app)
          .post('/players')
          .send({
            playername,
            email
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject players with non-string playername', function() {
        return chai.request(app)
          .post('/players')
          .send({
            playername: 1234,
            password,
            email
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Incorrect field type: expected string');
            expect(res.body.location).to.equal('playername');
          });
      });
      it('Should reject players with non-string password', function() {
        return chai.request(app)
          .post('/players')
          .send({
            playername,
            password: 1234,
            email
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Incorrect field type: expected string');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject players with non-string email', function() {
        return chai.request(app)
          .post('/players')
          .send({
            playername,
            password,
            email: 1234
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Incorrect field type: expected string');
            expect(res.body.location).to.equal('email');
          });
      });
      it('Should reject player with non-trimmed playername', function() {
        return chai.request(app)
          .post('/players')
          .send({
            playername: ` ${playername} `,
            password,
            email
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Cannot start or end with whitespace');
            expect(res.body.location).to.equal('playername');
          });
      });
      it('Should reject players with non-trimmed password', function() {
        return chai.request(app)
          .post('/players')
          .send({
            playername,
            password: ` ${password} `,
            email
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Cannot start or end with whitespace');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject players with empty playername', function() {
        return chai.request(app)
          .post('/players')
          .send({
            playername: '',
            password,
            email
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Must be at least 1 characters long');
            expect(res.body.location).to.equal('playername');
          });
      });
      it('Should reject players with password less than eight characters', function() {
        return chai.request(app)
          .post('/players')
          .send({
            playername,
            password: '1234567',
            email
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Must be at least 8 characters long');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject players with password greater than 72 characters', function() {
        return chai.request(app)
          .post('/players')
          .send({
            playername,
            password: new Array(73).fill('a').join(''),
            email
          })
          .then(() => expect.fail(null, null, 'Request should not succeed'))
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Must be at most 72 characters long');
            expect(res.body.location).to.equal('password');
          });
      });
      it('Should reject players with duplicate playername', function() {
        // Create an initial player
        return Player.create({
          playername,
          password,
          email
        })
        .then(() =>
          // Try to create a second player with same playername
          chai.request(app)
            .post('/players')
            .send({
              playername,
              password,
              email
            })
        )
        .then(() => expect.fail(null, null, 'Request should not succeed'))
        .catch(err => {
          if (err instanceof chai.AssertionError) {
            throw err;
          }

          const res = err.response;
          expect(res).to.have.status(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Player name already taken');
          expect(res.body.location).to.equal('playername');
        });
      });
      it('Should create a new player', function() {
        return chai.request(app)
          .post('/players')
          .send({
            playername,
            password,
            email
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('playername', 'email', 'password', 'scores');
            expect(res.body.playername).to.equal(playername);
            expect(res.body.email).to.equal(email);
            return Player.findOne({
              playername
            });
          })
          .then(player => {
            expect(player).to.not.be.null;
            expect(player.email).to.equal(email);
            return player.validatePassword(password);
          })
          .then(passwordIsCorrect => {
            expect(passwordIsCorrect).to.be.true;
          });
      });
      it('Should trim email', function() {
        return chai.request(app)
          .post('/players')
          .send({
            playername,
            password,
            email: ` ${email} `
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('playername', 'email', 'password', 'scores');
            expect(res.body.playername).to.equal(playername);
            expect(res.body.email).to.equal(email);
            return Player.findOne({
              playername
            });
          })
          .then(player => {
            expect(player).to.not.be.null;
            expect(player.email).to.equal(email);
          })
      });
    });
  });
});
