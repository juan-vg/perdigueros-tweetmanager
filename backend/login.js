var userAccModel = require("./models/user-accounts");
var mailCreator = require("./email-creator.js");
var crypto = require('crypto');
var objectID = require('mongodb').ObjectID;

// accountID = {email, passwd}
exports.localSignin = function (accountID, callback) {
	
	var error, data;
	
	var passwd = crypto.createHash('sha256').update(accountID.passwd).digest('base64');
	
	// validate password and get user data (avoiding retrieval of password)
	userAccModel.find({"email": accountID.email, "password": passwd}, {"password":0}, function(err, dbData){
		if(!err){
			
			if(dbData.length > 0 && dbData.validated){
				
				// get current date
				var lastDate = new Date();
				
				// generate token
				var token = crypto.randomBytes(25).toString('hex');
				
				// set token expiration date (10 mins)
				var tokenExpire = new Date();
				tokenExpire.setMinutes(tokenExpire.getMinutes() + 10);
				
				
				// update lastDate, token & tokenExpire
				userAccModel.update({"_id" : new objectID(dbData[0]._id)},
					{$set : {"lastDate": lastDate, "token": token, "tokenExpire": tokenExpire}},
					
					function(err, res){
						if(!err){
							// return token
							error = false;
							data = token;
						} else {
							error = true;
							data = "DB ERROR";
						}
						callback(error, data);
					}
				);

			} else if(dbData.length > 0) {
				// must validate the account yet
				error = true;
				data = "MUST VALIDATE";
				callback(error, data);
			} else {
				error = true;
				data = "INCORRECT";
				callback(error, data);
			}
			
		} else {
			error = true;
			data = "DB ERROR";
			callback(error, data);
		}
	});
};

exports.signup = function (accountData, callback) {
	
	var error, data;
	
	var dbUsers = new userAccModel();
	dbUsers.loginType = "local";
	dbUsers.name = accountData.name;
	dbUsers.surname = accountData.surname;
	dbUsers.email = accountData.email;
	dbUsers.registrationDate = new Date();
	dbUsers.validated = false;
	dbUsers.validateHash = crypto.randomBytes(20).toString('hex');
	dbUsers.activated = true;
	
	dbUsers.save(function(err,dbData){
		if(!err){
			
			var emailData = {
				"type": "validate",
				"name": dbUsers.name,
				"code": dbUsers.validateHash,
				"to": dbUsers.email
			};
			
			// async (not waiting for callback)
			mailCreator.sendMail(emailData, function(err, mData){
				if(err){
					console.log("LOGIN-SIGNUP: ERROR sending email to " + dbUsers.email);
				}
			});
			
			error = false;
			data = null;
			callback(error, data);
			
		} else {
			error = true;
			data = "DB ERROR";
			callback(error, data);
		}
	});
};

exports.validateUser = function (accountID, callback) {
	// TODO: validated = true
	// TODO: create passwd and send it to the user via email
	//crypto.createHash('sha256').update(accountData.passwd).digest('base64');
};

exports.remember = function (accountID, callback) {
	
};
