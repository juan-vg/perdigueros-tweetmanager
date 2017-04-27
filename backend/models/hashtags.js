var mongoose = require("mongoose");
var mongoSchema = mongoose.Schema;


var hashtagSchema = new mongoSchema({
	"twitterAccountId" : String,
	"hashtag" : String
});

var dbHashtags = mongoose.model('hashtags',hashtagSchema);
module.exports = dbHashtags;
