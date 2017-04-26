var userAccounts = require("./models/user-accounts");
var twitterAccounts = require("./models/twitter-accounts");

//Get all twitter accounts
exports.getAll = function(userToken, callback){
	var error;
	
	console.log("TWITTER-ACCOUNTS-GET-ALL: Checking database...");
	
	// Find user token and get twitter accounts
	userAccounts.aggregate([
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
	    }],function(err, res) {
			if(!err) {
				if(res[0] != null) {
					console.log("TWITTER-ACCOUNTS-GET-ALL: Obtained User:", res[0].email);
					console.log("TWITTER-ACCOUNTS-GET-ALL: Accounts in database: ", res[0].twitteraccounts);
					
					error = false;
					callback(error, res[0].twitteraccounts);
				} else {
					console.log("TWITTER-ACCOUNTS-GET-ALL: There is no user with this token.");
					
					error = false;
					//TODO al poner null da error, espera String o Buffer
					callback(error, null);
				}
				
			} else {
				console.log("TWITTER-ACCOUNTS-GET-ALL: Error performing query.");
				
				error = true;
				callback(error, null);
			}  			
		});
};

////Get a single account by ID
//exports.getAccount = function(idAccount, callback){
//	var error;
//
//	twAccModel.find({email:idAccount},function(err,data){ 
//		console.log("TWITTER-ACCOUNTS-GET-ID: Checking database...");
//
//		if(!err && data.length > 0){
//			console.log("TWITTER-ACCOUNTS-GET-ID: Account: ", data);
//
//			error = false;
//			callback(error, data);
//		} else if (data.length == 0) {
//			console.log("TWITTER-ACCOUNTS-GET-ID: There is no account with id=", idAccount );
//
//			error = true;
//			callback(error, null);
//		} else {
//			console.log("TWITTER-ACCOUNTS-GET-ID: Error while performing query" );
//
//			error = true;
//			callback(error, null);
//
//		}
//	});
//};
//
////Create new account
//exports.postAccount = function(request){
//
//	var db = new mongoOp();
//	var error;
//
//	//TODO obtener id de cuenta twitter 
//	db.idTwitterAccount ;
//	db.email = request.body.email;
//	db.information = request.body.information;
//	db.description = request.body.description;
//	db.activated = true;
//
//	// Insert new data into DB
//	db.save(function(err, result){
//		console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Trying to create new account: ", result);
//
//		if (!err) {
//			console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Last inserted account ID: ", result._id);
//			error = false;
//			callback(error, result._id);
//
//		} else {
//			console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Error while performing query.");
//			error = true
//			callback(error, null);
//		}
//	});
//};
//
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
//					error = null;
//					callback(error);
//
//				} else if (!err) {
//					console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: Error, user does not own this idAccount");
//					error = 'forbidden';
//					callback(error);
//
//				} else {
//					console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: Error fetching data");
//					error = 'error'
//						callback(error);
//				}
//			});
//
//		} else {
//			console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: ID account is not valid");
//		}
//	}
//};