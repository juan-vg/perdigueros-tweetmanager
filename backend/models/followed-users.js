var mongoose = require("mongoose");
var mongoSchema = mongoose.Schema;


var followedUsersSchema = new mongoSchema({
    "twitterAccountId" : String,
    "user" : String
});

var dbFollowedUsers = mongoose.model('followedusers',followedUsersSchema);
module.exports = dbFollowedUsers;