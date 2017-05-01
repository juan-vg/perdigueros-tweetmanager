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
	
	// Check if user owns that account 
	getUserEmail(userToken, function(err,res){
		if(!err) {
			twiAccModel.find({"email" : res, "_id" : new objectID(idAccount)}, function(err,data){

				if(!err && data.lenght > 0){
					console.log("TWITTER-ACCOUNTS-GET-ID: User owns that account");
					
					// Check if ID is valid
					var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
					if(typeof idAccount == 'string' && (idAccount.length == 12 || idAccount.length == 24 )
								&& checkForHexRegExp.test(idAccount)){
							console.log("TWITTER-ACCOUNTS-GET-ID: ID is valid.");
							
							// Find twitter account
							twiAccModel.findById(idAccount, function(err,res){
								console.log("TWITTER-ACCOUNTS-GET-ID: Checking database...");
								
								if(!err && res !== null){
									console.log("TWITTER-ACCOUNTS-GET-ID: Account: ", res);

									error = false;
									result = res;
								} else if (res.length === null) {
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

	//TODO a partir del token del usuario, buscar el email. Despues añadir en la coleccion de cuentas de twitter
	
	var dbTwitterAccounts = new twiAccModel();
	dbTwitterAccounts.information = newAccount.information;
	dbTwitterAccounts.description = newAccount.description;
	dbTwitterAccounts.email = email;
	dbTwitterAccounts.activated = false;
	
	console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Trying to create new account: ", dbTwitterAccounts);

	// Insert new data into DB
	dbTwitterAccounts.save(function(err, res){
		var error, result;
		console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: New account saved: ", res);

		if (!err) {
			console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Last inserted account ID: ", res._id);
			error = false;
			result = res._id;


		} else {
			console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Error while performing query.");
			error = true
			result = null;
			
		}
		callback(error, result);
	});
};

////delete account
//exports.deleteAccount = function(idAccount, userToken, callback){
//
//	var error;
//
//	// Check if ID is valid
//	var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
//	if(typeof idAccount == 'string') {
//		if (idAccount.length == 12 || (idAccount.length == 24 
//				&& checkForHexRegExp.test(idAccount))){
//
//			console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: ID is valid.");
//			//TODO obtener email asociado al userToken (db usuarios)
//			// ...userEmail
//
//			// Find and remove from DB
//			mongoOp.find({idTwitterAccount:idAccount, email:userEmail}, function(err,data){
//				console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: Checking database..");
//
//				if(!err && data.length > 0){
//
//					// Disable account
//					console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: Disabling account...");
//					//TODO activate = false
//
//					error = false;
//					callback(error);
//
//				} else if (!err) {
//					console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: Error, user does not own this idAccount");
//					error = 'forbidden';
//					callback(error);
//
//				} else {
//					console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: Error fetching data");
//					error = true;
//					callback(error);
//				}
//			});
//
//		} else {
//			console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: ID account is not valid");
//		}
//	}
//};