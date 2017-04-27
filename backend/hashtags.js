var usersModel = require("./models/user-accounts");
var twiAccModel = require("./models/twitter-accounts");
var hashtagsModel = require("./models/hashtags");

var objectID = require('mongodb').ObjectID;


//accountID {token, idTwitterAcount}

function getUserEmail(token, callback){
	
	var error, data;
	
	usersModel.find({"token" : token }, function(err, dbData) {
		if(!err && dbData.length > 0){
			console.log("HASHTAGS-GET-USER-EMAIL: token: " + token + " -> email: " + dbData[0].email);
			error = false;
			data = dbData[0].email;
		} else {
			console.log("HASHTAGS-GET-USER-EMAIL: NOT FOUND!!!");
			error = true;
			data = null;
		}
		callback(error, data);
	});
}

function verifyUser(accountID, callback){
	
	var success;
	
	getUserEmail(accountID.token, function(error, email){
			
			if(!error){
				twiAccModel.find({"email" : email, "_id" : accountID.twitterAccountId},
					
					function(err,dbData){
						
						if(!err && dbData.length > 0){
							console.log("HASHTAGS-VERIFY-USER: email: " + email + " owns TwitterAccount: " + accountID.twitterAccountId);
							success = true;
						} else {
							console.log("HASHTAGS-VERIFY-USER: email: " + email + " does NOT owns TwitterAccount: " + accountID.twitterAccountId);
							success = false;
						}
						
						callback(success);
					}
				);
				
			} else {
				console.log("HASHTAGS-VERIFY-USER: DB ERROR!!!");
				success = false;
				
				callback(success);
			}
		}
	);
}

exports.getAll = function (accountID, callback){

	var error, data;
	
	verifyUser(accountID, function(success){
		
		if(success){
			
			hashtagsModel.find({'twitterAccountId' : accountID.twitterAccountId},
			
				function(err,dbData){
					
					if(!err){
						error = false;
						
						if(dbData.length > 0){
							data = dbData;
						} else {
							data = '{[]}';
						}
					} else {
						error = true;
						data = "DB ERROR";
					}
					
					callback(error, data);
				}
			);
			
		} else {
			error = true;
			data = "FORBIDDEN";
			
			callback(error, data);
		}
	});
};

exports.get = function (accountID, hashtag, callback){
	
	var error, data;
	
	verifyUser(accountID, function(success){
		
		if(success){
			
			hashtagsModel.find({'twitterAccountId' : accountID.twitterAccountId, 'hashtag': hashtag},
			
				function(err,dbData){
					
					if(!err){
						
						if(dbData.length > 0){
							error = false;
							data = dbData;
						} else {
							error = true;
							data = "NOT FOUND";
						}
					} else {
						error = true;
						data = "DB ERROR";
					}
					
					callback(error, data);
				}
			);
			
		} else {
			error = true;
			data = "FORBIDDEN";
			
			callback(error, data);
		}
	});	
	
};

exports.post = function (accountID, hashtag, callback){
	
	var error, data;
	
	verifyUser(accountID, function(success){
		
		if(success){
			
			hashtagsModel.find({'twitterAccountId' : accountID.twitterAccountId, 'hashtag': hashtag},
				
				function(err,dbData){
					
					if(!err){
						error = false;
						
						if(dbData.length > 0){
							// 409
						} else {
							//db save
						}
					} else {
						error = true;
						data = "DB ERROR";
					}
					
					callback(error, data);
				}
			);
			
		} else {
			error = true;
			data = "FORBIDDEN";
			
			callback(error, data);
		}
	});		
	
};

exports.put = function (accountID, hashtag, callback){
	
	var error;
	
	
};

exports.delete = function (accountID, hashtag, callback){
	
	var error;
	
	
};
