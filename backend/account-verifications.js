var usersModel = require("./models/user-accounts");
var twiAccModel = require("./models/twitter-accounts");

var objectID = require('mongodb').ObjectID;


//accountID {token, idTwitterAcount}


// Checks if the supplied token has needed permissions
// PROVIDES PERMISSION BYPASS FOR ADMIN
function verifyUser(accountID, callback){
	
	var success;
    
    verifyAdmin(accountID, function(success){
		
		console.log("ACC-VERIFS-VERIFY-USER: Verifying token: " + accountID.token);
		
		// Admin permission bypass
		if(success){
			console.log("ACC-VERIFS-VERIFY-USER: ADMIN DETECTED. WHATEVER YOU WANT WILL BE GRANTED MY LORD. COME IN");
			callback(success);
		} else {

			if(accountID.twitterAccountId){
				checkTokenForTwitterAccount(accountID, function(success){
					callback(success);
				});
			} else if(accountID.userAccountId) {
				checkTokenForUserAccount(accountID, function(success){
					callback(success);
				});
			} else {
				success = false;
				callback(success);
			}
		}
	});
}
module.exports.verifyUser = verifyUser;


// Checks if the supplied token has admin permissions
function verifyAdmin(accountID, callback){
    
    var success;
    
    // get user data
    getUser(accountID.token, function(err, data){
            
        if(!err){
            success = data.admin;
        } else {
            success = false;
        }
        callback(success);            
    });
}
module.exports.verifyAdmin = verifyAdmin;


// Retrieves the email associated to the supplied token
function getUserEmail(token, callback){
    
    var data;
    
    // get user email from DB data
    getUser(token, function(err, dbData){
        if(!err){
			console.log("ACC-VERIFS-GET-USER-EMAIL: email: " + dbData.email);
            data = dbData.email;
        } else {
			console.log("ACC-VERIFS-GET-USER-EMAIL: ERROR! (" + dbData + ")");
            data = dbData;
        }
        callback(err, data);
    });
}
module.exports.getUserEmail = getUserEmail;


// Checks if the supplied token has access to the twitter account
function checkTokenForTwitterAccount(accountID, callback){
	
	var success;
    
    // get user email from token
    getUserEmail(accountID.token, function(err, data){
            
        if(!err){
            
            // check if the email matchs the twitterAccountId
            twiAccModel.find({"email" : data, "_id" : new objectID(accountID.twitterAccountId)},
                
                function(err, dbData){
                    
                    if(!err && dbData.length > 0){
                        console.log("ACC-VERIFS-CHK-TKN-4-TW-ACC: email: " + data + " owns TwitterAccount: " + accountID.twitterAccountId);
                        success = true;
                    } else {
                        console.log("ACC-VERIFS-CHK-TKN-4-TW-ACC: email: " + data + " does NOT owns TwitterAccount: " + accountID.twitterAccountId);
                        success = false;
                    }
                    
                    callback(success);
                }
            );
            
        } else {
            
            if(data == "NOT FOUND"){
                console.log("ACC-VERIFS-CHK-TKN-4-TW-ACC: CAN NOT VERIFY USER!");
            } else {
                console.log("ACC-VERIFS-CHK-TKN-4-TW-ACC: DB ERROR!!!");
            }
            
            success = false;
            
            callback(success);
        }
    });
}


// Checks if the supplied token has access to the user account
function checkTokenForUserAccount(accountID, callback){
	
	var success;
    
    // get user email from token
    getUser(accountID.token, function(err, data){
            
        if(!err){
            
            // check if the provided ID matchs the current userAccountId stored in DB
            if(dbData.length > 0 && dbData[0]._id == accountID.userAccountId){
				console.log("ACC-VERIFS-CHK-TKN-4-USR-ACC: GRANTED");
				success = true;
			} else {
				console.log("ACC-VERIFS-CHK-TKN-4-USR-ACC: FORBIDDEN");
				success = false;
			}
            
        } else {
            
            if(data == "NOT FOUND"){
                console.log("ACC-VERIFS-CHK-TKN-4-USR-ACC: CAN NOT VERIFY USER!");
            } else {
                console.log("ACC-VERIFS-CHK-TKN-4-USR-ACC: DB ERROR!!!");
            }
            
            success = false;
        }
        
        callback(success);
    });
}


// Retrieves the user data associated to the supplied token
function getUser(token, callback){
    
    var error, data;
    
    // get valid-user data from token
    usersModel.find({"token" : token, "validated": true, "activated": true }, {"password":0},
		function(err, dbData) {
			if(!err && dbData.length > 0){
				error = false;
				data = dbData[0];
			} else if(!err){
				error = true;
				data = "NOT FOUND";
			} else {
				error = true;
				data = "DB ERROR";
			}
			callback(error, data);
		}
    );
}
