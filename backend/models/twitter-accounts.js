var mongoose = require("mongoose");

//create instance of Schema
var mongoSchema =  mongoose.Schema;

//create schema
var twitterAccountsSchema  = new mongoSchema({
		"email" : String,
		"idTwitterAccount" : {
			"consumerKey" : String,
			"consumerSecret" : String,
			"accessToken" : String,
			"accessTokenSecret" : String
		},
		"information" : String,
		"description" : String,
		"activated" : Boolean
});

//create model if not exists.
var dbAccounts = mongoose.model('twitteraccounts',twitterAccountsSchema);
module.exports = dbAccounts;