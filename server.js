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
const {CLIENT_ORIGIN, PORT, PORTB, API_KEY, DATABASE_URL} = require('./config');

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

// For logging in. gets playername, matches what you put in, finds what you put in, validates password
passport.use(new PlayerStrategy(
  	function(playername, password, done) {
  		// Check if there is a player match
  		Player.getPlayerByPlayername(playername)
  		.then(function(player){
  			if(!player){
  				return done(null, false, {message: 'Unknown Player'});
  			}

  			// If there is a match, continue to code below
  			Player.comparePassword(password, player.password)
  				.then(function(isMatch){
  					if(isMatch){
  						return done(null, player);
  					} else {
  						return done(null, false, {message: 'Invalid password'});
  				}
  			});
  		})
  		.catch((err) => { throw err });
	}
));

passport.serializeUser(function(player, done) {
	done(null, player.id);
});

passport.deserializeUser(function(id, done) {
	Player.findById(id, function(err, player) {
		done(err, player);
	});
});

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


/*********************************************************************
	ROUTES
*********************************************************************/




//get movie options
app.get('/movieoptions/:title', (req, res) => {
	axios.get('https://api.themoviedb.org/3/search/movie?api_key='+API_KEY+'&language=en-US&query='+req.params.title+'&page=1&include_adult=false')
	.then(movies => {
		res.send(movies.data.results);
	})
	.catch(error => {
		console.error(error);
	})	
})

//get movie cast list
app.get('/moviedetails/:movieId', (req, res) => {
	axios.get('https://api.themoviedb.org/3/movie/'+req.params.movieId+'/credits?api_key='+API_KEY)
	.then(castinfo => {
		res.send(castinfo.data);
	})
	.catch(error => {
		console.error(error);
	})
})

//get castmember's movies
app.get('/castmembermovies/:castMemberId', (req, res) => {
	axios.get('https://api.themoviedb.org/3/person/'+req.params.castMemberId+'/movie_credits?api_key='+API_KEY)
	.then(movies => {
		res.send(movies.data)
	})
	.catch(error => {
		console.error(error);
	})
})

//get win page details
app.get('/castinfo/:castMemberId', (req, res) => {
	axios.get('https://api.themoviedb.org/3/person/'+req.params.castMemberId+'?api_key='+API_KEY+'&language=en-US')
	.then(info => {
		res.send(info.data)
	})
	.catch(error => {
		console.error(error);
	})
})


// Register New Player
app.post('/register', function(req, res) {
	const {playername, password, password2, email, scores} = req.body;

	// Validation
	req.checkBody('playername', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('playername', 'Playername is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	const errors = req.validationErrors();

	// If there are errors, render the form with errors, otherwise create new player with success msg, and go to login page
	if(errors){
		res.render('register', {
			errors: errors
		});
	} else {
		const newPlayer = new Player({playername, password, email, scores});

		// Creates mongoose new player, then success message and redirect to login
		Player.createPlayer(newPlayer)
		.then(function(player){
			req.flash('success_msg', 'You are registered and can track your greatness!');
			res.redirect('/players/login');
		})
		.catch(function(err) {
			console.error(err);
			req.flash('error_msg', 'An error occured');
			res.redirect('register');	
		})
	}
});

// Redirects for successful or failing authentication of post request to login
app.post('/login', 
	passport.authenticate('local', {successRedirect:'/', failureRedirect: '/players/login', failureFlash: true})
	);


// player Logout
app.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/players/login');
});

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