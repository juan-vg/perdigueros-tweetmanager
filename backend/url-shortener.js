var mongo = require('mongodb').MongoClient;
var objectID = require('mongodb').ObjectID;

// MongoDB - URLs DB - connection
var connection = 'mongodb://localhost:27017/urls';

exports.post = function (urlStr, callback){
	
	mongo.connect(connection, function(err, db) {
		
		console.log("Connected to MongoDB server");
		
		// Get documents
		var collection = db.collection('documents');
		
		// Define data to insert
		var url = {urlStr: urlStr};
		
		// Insert on MongoDB
		collection.insert(url, function(err, result) {
			
			if (!err) {
				console.log("Inserted URL Id: ", result.insertedIds[0]);
				var err = false;
				callback(err, result.insertedIds[0]);
			} else {
				console.log("ERROR: while inserting on DB");
				var err = true;
				callback(err, null);
			}
		});
		db.close();
	});
};

exports.get = function (urlId, callback){
	
	// If the urlId is NOT valid
	if(urlId.length < 24 || urlId.length > 24){
		var err = true;
		callback(err, null);
	} 
	// If the urlId is VALID
	else {
		mongo.connect(connection, function(err, db) {
		
			console.log("Connected to MongoDB server");
			
			// Get documents
			var collection = db.collection('documents');
			
			// Look for intended url on MongoDB
			collection.find({"_id" : new objectID(urlId) }).toArray(function(err, docs) {	
				console.log("Checking DB...");
				
				if(!err && docs.length > 0){
					console.log("URL: ", docs[0]);
					var err = false;
					callback(err, docs[0].urlStr);
				} else {
					console.log("No URL with id=", urlId);
					var err = true;
					callback(err, null);
				}
			});
			db.close();
		});
	}
};
