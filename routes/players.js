const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const db = require('mongodb').Db;
const passport = require('passport');
const PlayerStrategy = require('passport-local').Strategy;
const axios = require('axios');


const Player = require('../models/playerschema');
const DATABASE_URL = require('./../config');

// Register New Player
router.post('/register', function(req, res) {
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

// Redirects for successful or failing authentication of post request to login
router.post('/login', 
	passport.authenticate('local', {successRedirect:'/', failureRedirect: '/players/login', failureFlash: true})
	);

// player Logout
router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/players/login');
});

module.exports = router;
