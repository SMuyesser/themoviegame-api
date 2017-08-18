 const express = require('express');
 const cors = require('cors');
 const axios = require('axios');
 const path = require('path');
 const exphbs = require('express-handlebars');
 const bodyParser = require('body-parser');
 const morgan = require('morgan');
 const {CLIENT_ORIGIN, TMDB_API_KEY, PORT} = require('./config');

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

 app.get('/movieoptions/:title', (req, res) => {
 	axios.get('https://api.themoviedb.org/3/search/movie?api_key='+TMDB_API_KEY+'&language=en-US&query='+req.params.title+'&page=1&include_adult=false')
 	.then(movies => {
 		console.log(movies.data.results);
 		const movieoptions = movies.data.results;
 		res.send(movieoptions);
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