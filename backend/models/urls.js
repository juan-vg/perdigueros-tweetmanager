var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ptm');
var mongoSchema = mongoose.Schema;


var urlsSchema = new mongoSchema({
	"url": String
});

var dbUrls = mongoose.model('urls', urlsSchema);
module.exports = dbUrls;
