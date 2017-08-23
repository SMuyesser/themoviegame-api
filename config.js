
	exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'https://themoviegame.netlify.com'; /*|| 'https://localhost:3000' || 'http://localhost:3000';*/
	exports.PORT = process.env.PORT || 8080;
/*	DATABASE_URL: process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://localhost/thevideoshelfdb',
	TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/thevideoshelfdbtest',*/
	exports.API_KEY = process.env.API_KEY || process.env.TMDB_API_KEY;
