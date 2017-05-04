var mongoose = require('mongoose');
var mongoSchema = mongoose.Schema;


var urlsSchema = new mongoSchema({
	"url": String
});

var dbUrls = mongoose.model('urls', urlsSchema);
module.exports = dbUrls;
