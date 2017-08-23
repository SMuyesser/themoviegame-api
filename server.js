const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const {CLIENT_ORIGIN, PORT, API_KEY} = require('./config');


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

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = {app};