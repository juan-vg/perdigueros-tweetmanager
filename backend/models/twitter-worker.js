var mongoose = require("mongoose");

//create instance of Schema
var mongoSchema =  mongoose.Schema;

//create schema
var twitterWorkerSchema  = new mongoSchema({
    "userId" : String,
    "accId" : String,
    "action" : String,
    "newestTweetId" : String,
    "oldestTweetId" : String
});

//create model if not exists.
var dbTwitterWorker = mongoose.model('twitterworker',twitterWorkerSchema);
module.exports = dbTwitterWorker;
