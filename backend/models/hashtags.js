var mongoose = require("mongoose");
var mongoSchema = mongoose.Schema;


var hashtagSchema = new mongoSchema({
	"idTwitterAcount" : String,
	"hashtag" : String
});

var dbHashtags = mongoose.model('hashtags',hashtagSchema);
module.exports = dbHashtags;
