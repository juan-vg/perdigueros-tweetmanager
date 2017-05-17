var mongoose = require("mongoose");
var mongoSchema = mongoose.Schema;


var imageSchema = new mongoSchema({
    "hash" : String,
    "route" : String
});

var dbImages = mongoose.model('images',imageSchema);
module.exports = dbImages;