 const express = require('express');
 const cors = require('cors');
 const axios = require('axios');
 const bodyParser = require('body-parser');
 const morgan = require('morgan');
 const {CLIENT_ORIGIN, TMDB_API_KEY} = require('./config');

 const app = express();

 const PORT = process.env.PORT || 8080;

 app.use(morgan('common'));
 app.use(
 	cors({
 		origin: CLIENT_ORIGIN
 	})
 );
 app.use(bodyParser.json());

 app.get('/movieoptions/:title', (req, res) => {
 	axios.get('https://api.themoviedb.org/3/search/movie?api_key='+TMDB_API_KEY+'&language=en-US&query='+req.params.title+'&page=1&include_adult=false')
 	.then(res => {
 		console.log(res.data.results);
 		return res.data.results;
 	})
 	.catch(error => {
 		console.error(error);
 	})	
 })

 app.get('/api/*', (req, res) => {
   res.json({ok: true});
 });

 app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

 module.exports = {app};