var mongoose = require("mongoose");
var mongoSchema = mongoose.Schema;


var imageSchema = new mongoSchema({
    "hash" : String,
    "data" : Buffer,
    "contentType" : String
});

var dbImages = mongoose.model('images',imageSchema);
module.exports = dbImages;