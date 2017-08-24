const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const MongoStore = require('connect-mongo') (session);
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const db = require('mongodb').Db;
const passport = require('passport');
const PlayerStrategy = require('passport-local').Strategy;
const dotenv = require('dotenv');
dotenv.load();

const Player = require('./models/playerschema');
const {CLIENT_ORIGIN, PORT, DATABASE_URL} = require('./config');
const players = require('./routes/players');
const game = require('./routes/game');

const app = express();
app.use(morgan('common'));

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

app.use(
	cors({
		origin: CLIENT_ORIGIN
	})
);
app.use(bodyParser.json());
app.use(cookieParser());

// Set Static Folder public
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
	secret: 'random string',
	store: new MongoStore({
    url: DATABASE_URL,
    autoRemove: 'n'
  }),
  resave: true,
  saveUninitialized: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Variables for flash messages
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
  // Access the player anywhere, if not it will just be null
  res.locals.player = req.player || null;
	next();
});

app.use('/players', players);
app.use('/game', game);

mongoose.Promise = global.Promise;

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so declare `server` here
// and then assign a value to it in run
let server;

// this function connects to the database, then starts the server
function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.createConnection(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

// Generic response if page not found
app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});

// if app.js is called directly (aka, with `node app.js`), this block
// runs. but also export the runServer command so other code test code can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {runServer, app, closeServer};

// Function to ensure non players can't get into player functions
/*function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg', 'You must be logged in to access this page.');
		res.redirect('/players/login');
	}
}*/