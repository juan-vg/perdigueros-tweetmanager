var mongo = require('mongodb').MongoClient;
var objectID = require('mongodb').ObjectID;

var dbTwitterAccounts = require("../models/twitter-accounts");
var dbHashtags = require("../models/hashtags");



//accountID {token, idTwitterAcount}

// TODO: verificar la db de usuarios token -> email

function getUserEmail(){
	
}

function verifyUser(accountID, callback){
	
	var success;
	
	getUserEmail(accountID.token,
		function(email){
			dbTwitterAccounts.find({token: accountID.email, idTwitterAcount: accountID.idTwitterAcount},
				function(err,data){
					
					if(!err && data.length > 0){
						success = true;
					} else {
						success = false;
					}
					callback(success);
				}
			);
		}
	);
	
	
};

exports.getAll = function (accountID, callback){

	var error;
	
	verifyUser(accountID,
		function(success){
			dbHashtags.find({},function(err,data){
				
				if(!err){
					callback(data);
				} else {
					callback(null);
				}
			});
		}
	);
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
