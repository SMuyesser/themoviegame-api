	exports.CLIENT_ORIGIN = 'https://themoviegame.netlify.com';
	exports.PORT = process.env.PORT || 8000;
	exports.API_KEY = process.env.TMDB_API_KEY;
	exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/themoviegamedb';
	exports.JWT_SECRET = process.env.JWT_SECRET;
	exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
