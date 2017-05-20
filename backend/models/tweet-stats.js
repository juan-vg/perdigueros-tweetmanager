var mongoose = require("mongoose");
var mongoSchema = mongoose.Schema;


var tweetStatsSchema = new mongoSchema({
    "date" : Date,
    "country" : String,
    "userId" : String
});

var dbTweetStats = mongoose.model('tweetstats',tweetStatsSchema);
module.exports = dbTweetStats;
