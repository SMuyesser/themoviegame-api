const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const axios = require('axios');

const {API_KEY} = require('../config');

//get movie options
router.get('/movieoptions/:title', (req, res) => {
	axios.get('https://api.themoviedb.org/3/search/movie?api_key='+API_KEY+'&language=en-US&query='+req.params.title+'&page=1&include_adult=false')
	.then(movies => {
		res.send(movies.data.results);
	})
	.catch(error => {
		console.error(error);
	})	
})

//get movie cast list
router.get('/moviedetails/:movieId', (req, res) => {
	axios.get('https://api.themoviedb.org/3/movie/'+req.params.movieId+'/credits?api_key='+API_KEY)
	.then(castinfo => {
		res.send(castinfo.data);
	})
	.catch(error => {
		console.error(error);
	})
})

//get castmember's movies
router.get('/castmembermovies/:castMemberId', (req, res) => {
	axios.get('https://api.themoviedb.org/3/person/'+req.params.castMemberId+'/movie_credits?api_key='+API_KEY)
	.then(movies => {
		res.send(movies.data)
	})
	.catch(error => {
		console.error(error);
	})
})

//get win page details
router.get('/castinfo/:castMemberId', (req, res) => {
	axios.get('https://api.themoviedb.org/3/person/'+req.params.castMemberId+'?api_key='+API_KEY+'&language=en-US')
	.then(info => {
		res.send(info.data)
	})
	.catch(error => {
		console.error(error);
	})
})

module.exports = router;
