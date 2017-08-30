const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const {Player} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(jsonParser);

// Post to register a new user
router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['playername', 'password', 'email'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['playername', 'password', 'email'];
  const nonStringField = stringFields.find(field =>
    (field in req.body) && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  // If the playername and password aren't trimmed we give an error.  Users might
  // expect that these will work without trimming (i.e. they want the password
  // "foobar ", including the space at the end).  We need to reject such values
  // explicitly so the users know what's happening, rather than silently
  // trimming them and expecting the user to understand.
  // We'll silently trim the other fields, because they aren't credentials used
  // to log in, so it's less of a problem.
  const explicityTrimmedFields = ['playername', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(field =>
    req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    playername: {
      min: 1
    },
    password: {
      min: 8,
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(field =>
    'min' in sizedFields[field] &&
    req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(field =>
    'max' in sizedFields[field] &&
    req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField ?
        `Must be at least ${sizedFields[tooSmallField].min} characters long` :
        `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let {playername, password, email} = req.body;
  // Username and password come in pre-trimmed, otherwise we throw an error
  // before this
  email = email.trim();

  return Player
    .find({playername})
    .count()
    .then(count => {
      if (count > 0) {
        // There is an existing user with the same username
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Player name already taken',
          location: 'playername'
        });
      }
      // If there is no existing user, hash the password
      return Player.hashPassword(password)
    })
    .then(hash => {
      return Player
        .create({
          playername,
          password: hash,
          email
        })
    })
    .then(player => {
      return res.status(201).json(player.apiRepr());
    })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});


//post scores for player
router.put('/scores/:player', (req, res) => {
  Player.findOne({'playername':req.params.player}, function (err, player) {  
      if (err) {
          res.status(500).send(err);
      } else {
          console.log(req.body);
          player.scores = [...player.scores, req.body];

          // Save the updated document back to the database
          player.save(function (err, player) {
              if (err) {
                  res.status(500).send(err)
              }
              res.send(player);
          });
      }
  });
});


/*router.get('/', (req, res) => {
  return Player
    .find()
    .then(players => res.json(players.map(player => player.apiRepr())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});*/

module.exports = {router};
