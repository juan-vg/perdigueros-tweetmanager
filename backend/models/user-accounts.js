var mongoose = require("mongoose");

//create instance of Schema
var mongoSchema =   mongoose.Schema;

var usersAccountsSchema = new mongoSchema({
	"loginType": String, // local, Facebook, Google, OpenID, ...
	"name": String,
	"surname": String,
	"email": String,
	"password": String,
	"registrationDate": Date,
	"lastAccess": Date,
	"admin": Boolean,
	"token": String,
	"validated": Boolean, // true if (external login | confirmed email)
	"activated": Boolean // false if it is a "deleted" account
});

var dbUsers = mongoose.model('useraccounts', usersAccountsSchema);
module.exports = dbUsers;