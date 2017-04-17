var mongoOp = require("../models/twitter-accounts");

// Get all twitter accounts
exports.getAll = function(userToken, callback){
	var error;
	
	// TODO buscar token del usuario y mostrar las cuentas de twitter que tengan ese email
	// (en la tabla de usuarios)
	mongoOp.find({token:userToken},function(err,data){ 
		if(!err){
			console.log("TWITTER-ACCOUNTS-GET-ALL: Checking database...");
			console.log("TWITTER-ACCOUNTS-GET-ALL: Accounts in database: ", data);
		
			error = false;
			callback(error, data);

		} else{
			console.log("TWITTER-ACCOUNTS-GET-ALL: Error while performing query.");

			error = true;
			callback(error, null);
		}
	});
};

// Get a single account by ID
exports.getAccount = function(idAccount, callback){
	
	mongoOp.find({idTwitterAccount:idAccount},function(err,data){ 
		console.log("TWITTER-ACCOUNTS-GET-ID: Checking database...");
		
		if(!err){
			console.log("TWITTER-ACCOUNTS-GET-ID: Account: ", data);
			
			callback(error, data);

		} else {
			console.log("TWITTER-ACCOUNTS-GET-ID: There is no account with id=", id );
			
			callback(error, data);
			
		}
	});
};

// Create new account
exports.postAccount = function(request){
	
	var db = new mongoOp();
	var error;
	
	//TODO obtener id de cuenta twitter 
	db.idTwitterAccount ;
	db.email = request.body.email;
	db.information = request.body.information;
	db.description = request.body.description;
	db.activated = true;

	// Insert new data into DB
	db.save(function(err, result){
		console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Trying to create new account: ", result);

		if (!err) {
			console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Last inserted account ID: ", result._id);
			error = false;
			callback(error, result._id);

		} else {
			console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Error while performing query.");
			error = true
			callback(error, null);
		}
	});
};

// delete account
exports.deleteAccount = function(idAccount, userToken, callback){
	
	var error;
	
	// Check if ID is valid
	var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
	if(typeof idAccount == 'string') {
		if (idAccount.length == 12 || (idAccount.length == 24 
				&& checkForHexRegExp.test(idAccount))){

			console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: ID is valid.");
			//TODO obtener email asociado al userToken (db usuarios)
			// ...userEmail
			
			// Find and remove from DB
			mongoOp.find({idTwitterAccount:idAccount, email:userEmail}, function(err,data){
				console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: Checking database..");
				
				if(!err && data.length > 0){

					// Disable account
					console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: Disabling account...");
					//TODO activate = false
						
					error = null;
					callback(error);
								
				} else if (!err) {
					console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: Error, user does not own this idAccount");
					error = 'forbidden';
					callback(error);
					
				} else {
					console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: Error fetching data");
					error = 'error'
					callback(error);
				}
			});
		} else {
			console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: ID account is not valid");
		}
	}
};