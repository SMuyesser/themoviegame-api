const mongoose = require('mongoose');
const bcrypt =require('bcryptjs');

const PlayerSchema = mongoose.Schema({
	playername: {
		type: String,
		index: true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	scores: [{
		start: {
			type: String
		},
		end: {
			type: String
		},
		links: {
			type: Number
		}
	}]
});


// Model Functions
/*PlayerSchema.pre('save', function(next) {
  const player = this;
  if (player.isModified('password')) {
    bcrypt.genSalt(10)
      .then((salt) => bcrypt.hash(player.password, salt))
      .then((hash) => {
        player.password = hash;
        next();
      })
      .catch((err) => next(err));
  } else {
    next();
  }
});*/

const Player = module.exports = mongoose.model('Player', PlayerSchema);

module.exports.createPlayer = function(player) {
	return bcrypt.genSalt(10)
	.then(function(salt){
		return bcrypt.hash(player.password, salt)
	})
	.then(function(hash){
		player.password = hash;
		player.save();
	})
	.catch(function(err){console.error(err); throw err;})
}

// Gets playername using mongoose method findone
module.exports.getPlayerByPlayername = function(playername){
	const query = {playername: playername};
	return Player.findOne(query)
}

// checks to see if password is match
module.exports.comparePassword = function(candidatePassword, hash){
	return bcrypt.compare(candidatePassword, hash) 
}

