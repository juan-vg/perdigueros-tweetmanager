var usersModel = require("./models/user-accounts");
var twiAccModel = require("./models/twitter-accounts");

var objectID = require('mongodb').ObjectID;


//accountID {token, idTwitterAcount}


// Checks if the supplied token has access to the twitter account
// PROVIDES PERMISSION BYPASS FOR ADMIN
function verifyUser(accountID, callback){
	
	var success;
    
    verifyAdmin(accountID, function(success){
		
		// Admin permission bypass
		if(success){
			console.log("ACCOUNT-VERIFS-VERIFY-USER: ADMIN DETECTED. WHATEVER YOU WANT WILL BE GRANTED MY LORD. COME IN");
			callback(success);
		} else {
			checkUser(accountID, function(success){
				callback(success);
			});
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
			console.log("ACCOUNT-VERIFS-GET-USER-EMAIL: email: " + dbData.email);
            data = dbData.email;
        } else {
			console.log("ACCOUNT-VERIFS-GET-USER-EMAIL: ERROR! (" + dbData + ")");
            data = dbData;
        }
        callback(err, data);
    });
}
module.exports.getUserEmail = getUserEmail;


// Checks if the supplied token has access to the twitter account
function checkUser(accountID, callback){
	
	var success;
    
    // get user email from token
    getUserEmail(accountID.token, function(err, data){
            
        if(!err){
            
            // check if the email matchs the twitterAccountId
            twiAccModel.find({"email" : data, "_id" : new objectID(accountID.twitterAccountId)},
                
                function(err, dbData){
                    
                    if(!err && dbData.length > 0){
                        console.log("ACCOUNT-VERIFS-CHECK-USER: email: " + data + " owns TwitterAccount: " + accountID.twitterAccountId);
                        success = true;
                    } else {
                        console.log("ACCOUNT-VERIFS-CHECK-USER: email: " + data + " does NOT owns TwitterAccount: " + accountID.twitterAccountId);
                        success = false;
                    }
                    
                    callback(success);
                }
            );
            
        } else {
            
            if(data == "NOT FOUND"){
                console.log("ACCOUNT-VERIFS-CHECK-USER: CAN NOT VERIFY USER!");
            } else {
                console.log("ACCOUNT-VERIFS-CHECK-USER: DB ERROR!!!");
            }
            
            success = false;
            
            callback(success);
        }
    });
}

// Retrieves the user data associated to the supplied token
function getUser(token, callback){
    
    var error, data;
    
    // get user from token
    usersModel.find({"token" : token }, function(err, dbData) {
        if(!err && dbData.length > 0){
            console.log("ACCOUNT-VERIFS-GET-USER: token: " + token);
            error = false;
            data = dbData[0];
        } else if(!err){
            console.log("ACCOUNT-VERIFS-GET-USER: TOKEN NOT FOUND!");
            error = true;
            data = "NOT FOUND";
        } else {
            console.log("ACCOUNT-VERIFS-GET-USER: DB ERROR!!!");
            error = true;
            data = "DB ERROR";
        }
        callback(error, data);
    });
}
