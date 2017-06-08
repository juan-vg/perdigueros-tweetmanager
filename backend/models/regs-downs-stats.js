var mongoose = require("mongoose");
var mongoSchema = mongoose.Schema;


var regsDownsStatsSchema = new mongoSchema({
    "regDown": Boolean, // true: registration, false: down
    "date" : Date
});

var dbRegsDownsStats = mongoose.model('regdownsstats',regsDownsStatsSchema);
module.exports = dbRegsDownsStats;