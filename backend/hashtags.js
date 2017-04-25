var usersModel = require("./models/users");
var twiAccModel = require("./models/twitter-accounts");
var hashtagsModel = require("./models/hashtags");

var objectID = require('mongodb').ObjectID;


//accountID {token, idTwitterAcount}

// TODO: verificar la db de usuarios token -> email

function getUserEmail(token, callback){
	
	var error, data;
	
	urlsModel.find({"token" : token }, function(err, dbData) {
		if(!err && data.length > 0){
			error = false;
			data = dbData[0].email
		} else {
			error = true;
			data = null;
		}
		callback(error, data);
	});
}

function verifyUser(accountID, callback){
	
	var success;
	
	getUserEmail(accountID.token,
		function(error, email){
			
			if(!error){
				dbTwitterAccounts.find({"email" : email, "idTwitterAcount" : accountID.idTwitterAcount},
					
					function(err,dbData){
						
						if(!err && dbData.length > 0){
							success = true;
						} else {
							success = false;
						}
					}
				);
				
			} else {
				success = false;
			}
			
			callback(success);
		}
	);
}

exports.getAll = function (accountID, callback){

	var error, data;
	
	verifyUser(accountID, function(success){
		
		if(success){
			dbHashtags.find({},function(err,dbData){
				
				if(!err){
					error = false;
					data = dbData;
				} else {
					error = true;
					data = "DB ERROR";
				}
			});
			
		} else {
			error = true;
			data = "FORBIDDEN";
		}
		
		callback(error, data);
	});
};

exports.get = function (accountID, hashtag, callback){
	
	var error;
	
	
};

exports.post = function (accountID, hashtag, callback){
	
	var error;
	
	
};

exports.put = function (accountID, hashtag, callback){
	
	var error;
	
	
};

exports.delete = function (accountID, hashtag, callback){
	
	var error;
	
	
};
