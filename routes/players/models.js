const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const PlayerSchema = mongoose.Schema({
	playername: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	scores: [{
		start: {
			type: String
		},
		startPic: {
			type: String
		},
		end: {
			type: String
		},
		endPic: {
			type: String
		},
		links: [{
			type: String
		
		}],
		linkCount: {
			type: Number
		}
	}]
});

PlayerSchema.methods.apiRepr = function() {
  return {
    playername: this.playername || '',
    password: this.password || '',
    email: this.email || '',
    scores: [...this.scores] || []
  };
}

PlayerSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
}

PlayerSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
}

const Player = mongoose.model('Player', PlayerSchema);

module.exports = {Player};

