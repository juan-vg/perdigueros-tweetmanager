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
    "tokenExpire": Date, // Updated on every access
    "validated": Boolean, // true if (external login | confirmed email)
    "validateHash": String, // send to email in order to verify it
    "firstLogin": Boolean, // true if the user has not logged in yet
    "activated": Boolean // false if it is a "deleted" account
});

var dbUsers = mongoose.model('useraccounts', usersAccountsSchema);
module.exports = dbUsers;
