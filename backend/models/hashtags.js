var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/ptm');
var mongoSchema = mongoose.Schema;


var hashtagSchema = new mongoSchema {
	"idTwitterAcount" : String,
	"hashtag" : String
};

var dbHashtags = mongoose.model('hashtags',hashtagSchema);
module.exports = dbHashtags;
