var urlsModel = require('./models/urls.js');
var objectID = require('mongodb').ObjectID;


exports.post = function (urlStr, callback){
	
	var error, data;
    
    urlsModel.find({url: urlStr}, function(err, dbData){
        if(!err){
            
            if(dbData.length > 0){
                console.log("URL-SHORTENER-POST: Existing URL Id: " + dbData[0]._id);
                error = false;
                data = dbData[0]._id;
                
                callback(error, data);
                
            } else {
                
                // Define data to insert
                var dbUrls = new urlsModel();
                dbUrls.url = urlStr;
                
                // Insert on MongoDB
                dbUrls.save(function(err, result) {
                    
                    if (!err) {
                        console.log("URL-SHORTENER-POST: Inserted URL Id: " + result._id);
                        error = false;
                        data = result._id;
                        
                    } else {
                        console.log("URL-SHORTENER-POST: ERROR while inserting on DB!!!");
                        error = true;
                        data = null;
                    }
                    
                    callback(error, data);
                });
            }
            
        } else {
            console.log("URL-SHORTENER-POST: ERROR while finding on DB!!!");
            error = true;
            data = null;
            
            callback(error, data);
        }
    });
	
	
};

exports.get = function (urlId, callback){
	
	var error, data;
	
	// If the urlId is NOT valid
	var checkId = new RegExp("^[0-9a-fA-F]{24}$");
	if ( !(typeof urlId == 'string' && (urlId.length == 12 || urlId.length == 24) && checkId.test(urlId) ) ){
		error = true;
		data = null;
		callback(error, data);
		
	} else {
		// If the urlId is VALID
		
		// Look for intended url on MongoDB
		urlsModel.find({"_id" : new objectID(urlId) }, function(err, dbData) {	
			
			if(!err && dbData.length > 0){
				console.log("URL-SHORTENER-GET: URL: " + dbData[0].url);
				error = false;
				data = dbData[0].url;
			} else {
				console.log("URL-SHORTENER-GET: No URL with id=" + urlId);
				error = true;
				data = null;
			}
			
			callback(error, data);
		});
	}
};
