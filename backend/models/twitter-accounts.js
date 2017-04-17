var mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/twitter-accounts');

//create instance of Schema
var mongoSchema =   mongoose.Schema;

//create schema
var accountsSchema  = {
		"idTwitterAccount" : String,
		"email" : String,
		"information" : String,
		"description" : String,
		"activated" : String
};

//create model if not exists.
module.exports = mongoose.model('twitter-accounts',accountsSchema);