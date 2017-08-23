module.exports = {
	CLIENT_ORIGIN: 'http://localhost:3000' || 'https://themoviegame.netlify.com',
	TMDB_API_KEY: '7e9a1ff04b7576b3330211792aa796b5',
	PORT: process.env.PORT || 8080,
	DATABASE_URL: process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://localhost/thevideoshelfdb',
	TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/thevideoshelfdbtest'
};