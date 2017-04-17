var mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/hashtags');

//create instance of Schema
var mongoSchema = mongoose.Schema;

//create schema
var hashtagSchema = {
	"idTwitterAcount" : String,
	"hashtag" : String
};

//create model if not exists.
module.exports = mongoose.model('hashtags',hashtagSchema);
