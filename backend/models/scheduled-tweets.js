var mongoose = require("mongoose");
var mongoSchema = mongoose.Schema;


var schedTweetsSchema = new mongoSchema({
	"twitterAccountId": String,
    "text" : String,
    "publishDate" : Date,
    "published" : Boolean
});

var dbSchedTweets = mongoose.model('scheduledtweets',schedTweetsSchema);
module.exports = dbSchedTweets;
