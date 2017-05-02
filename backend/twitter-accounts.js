var userModel = require("./models/user-accounts");
var twiAccModel = require("./models/twitter-accounts");
var objectID = require('mongodb').ObjectID;

//Get the user email
function getUserEmail(userTtoken, callback){
	var error, data;

    userModel.find({"token" : userTtoken }, function(err, data) {
        if(!err && data !== null){
            console.log("TWITTER-ACCOUNTS-GET-USER-EMAIL: token: " + userTtoken + " -> email: " + data[0].email);
            error = false;
            data = data[0].email;
        } else if(!err){
            console.log("TWITTER-ACCOUNTS-GET-USER-EMAIL: Token not found");
            error = true;
            data = "NOT FOUND";
        } else {
            console.log("TWITTER-ACCOUNTS-GET-USER-EMAIL: Error while performing query");
            error = true;
            data = "DB ERROR";
        }
        callback(error, data);
    });
}

//Get all twitter accounts
exports.getAll = function(userToken, callback){
	var error;
	var result;
	
	console.log("TWITTER-ACCOUNTS-GET-ALL: Checking database...");
	
	// Find user token and get twitter accounts
	userModel.aggregate([
		{"$match":
	    	{'token': userToken} 
	    },
	    {"$lookup":
	       	{
	        	from: "twitteraccounts",
	        	localField: "email",
	        	foreignField: "email",
	        	as: "twitteraccounts"
	    }	
	    }], function(err, res) {
			if(!err) {
				console.log(res);
				if(res[0] !== null && res.length > 0) {
					console.log("TWITTER-ACCOUNTS-GET-ALL: Obtained User:", res[0].email);
					console.log("TWITTER-ACCOUNTS-GET-ALL: Accounts in database: ", res[0].twitteraccounts);
					
					error = false;
					result = res[0].twitteraccounts;
				} else {
					console.log("TWITTER-ACCOUNTS-GET-ALL: There is no user with this token.");
					
					error = true;
					result = "FORBIDDEN"; //???
				}
			} else {
				console.log("TWITTER-ACCOUNTS-GET-ALL: Error while performing query.");
				
				error = true;
				result = [];
			}  	
			
			callback(error, result);
	});
};

//Get a single account by ID
exports.getAccount = function(idAccount, userToken, callback){
	var error;
	var result;
	
	//TODO validar ID antes de hacer el find!!!!
	
	// Check if user owns that account and get the email
	getUserEmail(userToken, function(err, email){

		if(!err) {
			twiAccModel.find({"email" : email, "_id" : new objectID(idAccount)}, function(errDb,data){

				if(!errDb && data.lenght !== null){
					console.log("TWITTER-ACCOUNTS-GET-ID: User owns that account");
					
					// Check if ID is valid
					var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
					if(typeof idAccount == 'string' && (idAccount.length == 12 || idAccount.length == 24 )
								&& checkForHexRegExp.test(idAccount)){
							console.log("TWITTER-ACCOUNTS-GET-ID: ID is valid.");
							
							// Find twitter account
							twiAccModel.findById(idAccount, function(errDb2,res){
								console.log("TWITTER-ACCOUNTS-GET-ID: Checking database...");
								
								if(!errDb2 && res !== null){
									console.log("TWITTER-ACCOUNTS-GET-ID: Account: ", res);

									error = false;
									result = res;
								} else if (res === null) {
									console.log("TWITTER-ACCOUNTS-GET-ID: There is no account with id=", idAccount );

									error = true;
									result = "NOT FOUND"; //???
								} else {
									console.log("TWITTER-ACCOUNTS-GET-ID: Error while performing query" );

									error = true;
									result = "ERROR";
								}
								callback(error, result);
							});
					} else {
						console.log("TWITTER-ACCOUNTS-GET-ID: ID account is not valid");
						
						error = true;
						result = "ID NOT VALID";
						callback(error, result);
					}
				} else {
					console.log("TWITTER-ACCOUNTS-GET-ID: User does not own that account");
					
					error = true;
					result = "FORBIDDEN" ; 
					callback(error, result);
				} 
			});
		} else {
			if(res == "NOT FOUND"){
                console.log("TWITTER-ACCOUNTS-GET-ID: User does not own that account");
            } else {
                console.log("TWITTER-ACCOUNTS-GET-ID: DB error");
            }
		}
	});
};

//Create new account
exports.postAccount = function(userToken, newAccount, callback){
	var error, result;	
	console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Trying to create new account: ", newAccount);
	
	getUserEmail(userToken, function(err, email){
		if(!err) {
			
			// Check if the account already exists
			twiAccModel.find({"information": newAccount.information}, function(err,res){
				if(!err){
					if(res !== null && res.length > 0){
						 console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Account already exists ", res);
						 
						 error = true;
						 result = "EXIST";
						 callback(error, result);
						
					} else {
						console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Account does not exist. Adding..");
						
						// Add the account to the collection
						var dbTwitterAccounts = new twiAccModel();
						dbTwitterAccounts.information = newAccount.information;
						dbTwitterAccounts.description = newAccount.description;
						dbTwitterAccounts.email = email;
						dbTwitterAccounts.activated = true;
						
						// Insert new data into DB
						dbTwitterAccounts.save(function(err, res){
							console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: New account saved: ", res);

							if (!err) {
								console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Last inserted account ID: ", res._id);
								error = false;
								result = res._id;


							} else {
								console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Error while saving account.");
								error = true
								result = "DB ERROR";
								
							}
							callback(error, result);
						});
					}
				} else {
					console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Error while performing query.");
					
					error = true
					result = "DB ERROR";
					callback(error, result);
				}
			});
		} else {
			if(res == "NOT FOUND"){
                console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: User can not be verified");
            } else {
                console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: DB error");
            }
		}
	});
};

//delete account
exports.deleteAccount = function(userToken, idAccount, callback){
	var error, result;
	console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: Trying to disable account: ", idAccount);

	getUserEmail(userToken, function(err, data){
		if(!err) {
			
			//Check if ID is valid
			var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
			if(typeof idAccount == 'string' && (idAccount.length == 12 || idAccount.length == 24 )
						&& checkForHexRegExp.test(idAccount)){
				console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: ID is valid.");
				
				// Check if the account exists
				twiAccModel.find({"information": idAccount.information}, function(err,res){
					if(!err){
						if(res !== null && res.length > 0){
							 console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: Account exists ", res);
							 
							 // Disable account
							 twiAccModel.update({"_id" : objectID(idAccount)},{$set : {"activated":false}}, 
									 function(err,res){
								 if(!err){
									 console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: Account disabled");
									 
									 error = false;
									 result = null;
								 } else {
									 console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: Error disabling account");
									 
									 error = true;
									 result = "DB ERROR";
								 }
								 callback(error, result);
							 });
						} else {
							console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: Account does not exist.");
							
							error = true;
							result = "NOT FOUND";
							callback(error, result);
						}
					} else {
						console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: Error while performing query.");
						
						error = true
						result = "DB ERROR";
						callback(error, result);
					}
				});
			} else {
				console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: ID is not valid.");
				error = true;
				result = "NOT FOUND";
				callback(error, result);
			}
		} else {
			if(res == "NOT FOUND"){
                console.log("TTWITTER-ACCOUNTS-DEL-ACCOUNT: User can not be verified");
                
                error = true;
                result = "FORBIDDEN";
            } else {
                console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: DB error");
                
                error = true;
                result = "DB ERROR";
            }
			callback(error, result);
		}
	});
};