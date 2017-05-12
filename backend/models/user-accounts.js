var mongoose = require("mongoose");

//create instance of Schema
var mongoSchema =   mongoose.Schema;

var usersAccountsSchema = new mongoSchema({
	"name": String,
	"surname": String,
	"email": String,
	"password": String,
	"registrationDate": Date,
	"lastAccess": Date,
	"activated": Boolean,
	"admin": Boolean,
	"token": String
});

var dbUsers = mongoose.model('useraccounts', usersAccountsSchema);
module.exports = dbUsers;
