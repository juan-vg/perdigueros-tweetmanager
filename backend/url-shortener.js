var mongo = require('mongodb').MongoClient;
var objectID = require('mongodb').ObjectID;

// MongoDB - URLs DB - connection
var connection = 'mongodb://localhost:27017/urls';


//TODO: prefijos en logs
//TODO: mongoose

exports.post = function (urlStr, callback){
	
	var error;
	
	mongo.connect(connection, function(err, db) {
		
		if(!err){
			console.log("Connected to MongoDB server");
			
			// Get documents
			var collection = db.collection('documents');
			
			// Define data to insert
			var url = {urlStr: urlStr};
			
			// Insert on MongoDB
			collection.insert(url, function(err, result) {
				
				if (!err) {
					console.log("Inserted URL Id: ", result.insertedIds[0]);
					error = false;
					callback(error, result.insertedIds[0]);
				} else {
					console.log("ERROR: while inserting on DB");
					error = true;
					callback(error, null);
				}
			});
			db.close();
			
		} else {
			console.log("ERROR: while connecting to DB");
			error = true;
			callback(error, null);
		}
	});
};

exports.get = function (urlId, callback){
	
	var error;
	
	// If the urlId is NOT valid
	var checkId = new RegExp("^[0-9a-fA-F]{24}$");
	if ( !(typeof urlId == 'string' && (urlId.length == 12 || urlId.length == 24) && checkId.test(urlId) ) ){
		error = true;
		callback(error, null);
		
	} else {
		// If the urlId is VALID
		
		mongo.connect(connection, function(err, db) {
		
			if(!err){
				console.log("Connected to MongoDB server");
				
				// Get documents
				var collection = db.collection('documents');
				
				// Look for intended url on MongoDB
				collection.find({"_id" : new objectID(urlId) }).toArray(function(err, docs) {	
					console.log("Checking DB...");
					
					if(!err && docs.length > 0){
						console.log("URL: ", docs[0]);
						error = false;
						callback(error, docs[0].urlStr);
					} else {
						console.log("No URL with id=", urlId);
						error = true;
						callback(error, null);
					}
				});
				db.close();
				
			} else {
				console.log("ERROR: while connecting to DB");
				error = true;
				callback(error, null);
			}
		});
	}
};
