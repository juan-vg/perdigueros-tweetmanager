var mongoose = require("mongoose");
var mongoSchema = mongoose.Schema;


var loginStatsSchema = new mongoSchema({
    "date" : Date
});

var dbLoginStats = mongoose.model('loginstats',loginStatsSchema);
module.exports = dbLoginStats;