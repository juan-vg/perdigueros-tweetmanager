var mongoose = require("mongoose");

//create instance of Schema
var mongoSchema =  mongoose.Schema;

//create schema
var twitterStatsSchema  = new mongoSchema({
    "userId" : String,
    "tweetIdStr" : String,
    "favorites" : Number,
    "retweets" : Number,
    "date" : Date
});

//create model if not exists.
var dbTwitterStats = mongoose.model('twitterstats',twitterStatsSchema);
module.exports = dbTwitterStats;
