var usersModel = require("./models/user-accounts");
var twiAccModel = require("./models/twitter-accounts");

var objectID = require('mongodb').ObjectID;


//accountID {token, idTwitterAcount} OR {token, userAccountId}


// Checks if the supplied token has needed permissions
// PROVIDES PERMISSION BYPASS FOR ADMIN
function verifyUser(accountID, callback){
    
    var success, reason;
    
    verifyAdmin(accountID, function(success){
        
        console.log("ACC-VERIFS-VERIFY-USER: Verifying token: " + accountID.token);
        
        // Admin permission bypass
        if(success){
            console.log("ACC-VERIFS-VERIFY-USER: ADMIN DETECTED. WHATEVER YOU WANT WILL BE GRANTED MY LORD. COME IN");
            reason = "ADMIN";
            callback(success, reason);
        } else {

            if(accountID.twitterAccountId){
                checkTokenForTwitterAccount(accountID, function(success, reason){
                    callback(success, reason);
                });
            } else if(accountID.userAccountId) {
                checkTokenForUserAccount(accountID, function(success, reason){
                    callback(success, reason);
                });
            } else if(accountID.lookingForEmail) {
                getUserEmail(accountID.token, function(err, reason){
                    callback(!err, reason);
                });
            } else {
                success = false;
                reason = "METHOD NOT FOUND";
                callback(success, reason);
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
    
    var success, reason;
    
    // get user email from token
    getUserEmail(accountID.token, function(err, data){
            
        if(!err){

            twiAccModel.find({"_id" : new objectID(accountID.twitterAccountId), "activated": true},
                
                function(err, dbData){
                    
                    if(!err && dbData.length > 0){
                        
                        // check if the email matchs the twitterAccountId
                        if(data == dbData[0].email){
                            console.log("ACC-VERIFS-CHK-TKN-4-TW-ACC: email: " + data + " owns TwitterAccount: " + accountID.twitterAccountId);
                            success = true;
                            reason = null;
                        } else {
                            console.log("ACC-VERIFS-CHK-TKN-4-TW-ACC: email: " + data + " does NOT owns TwitterAccount: " + accountID.twitterAccountId);
                            success = false;
                            reason = "FORBIDDEN";
                        }
 
                    } else if(!err){
                        console.log("ACC-VERIFS-CHK-TKN-4-TW-ACC: TwitterAccount: " + accountID.twitterAccountId + " NOT found!");
                        success = false;
                        reason = "ACCOUNT NOT FOUND";
                    } else {
                        console.log("ACC-VERIFS-CHK-TKN-4-TW-ACC: DB ERROR!!!");
                        success = false;
                        reason = "DB ERROR";
                    }
                    
                    callback(success, reason);
                }
            );
            
        } else {
            
            if(data == "NOT FOUND"){
                console.log("ACC-VERIFS-CHK-TKN-4-TW-ACC: CAN NOT VERIFY USER!");
                reason = "USER NOT FOUND";
            } else {
                console.log("ACC-VERIFS-CHK-TKN-4-TW-ACC: DB ERROR!!!");
                reason = "DB ERROR";
            }
            
            success = false;
            callback(success, reason);
        }
    });
}


// Checks if the supplied token has access to the user account
function checkTokenForUserAccount(accountID, callback){
    
    var success, reason;
    
    // get user data from token
    getUser(accountID.token, function(err, data){
            
        if(!err){
            
            // check if the provided ID matchs the current userAccountId stored in DB
            if(data._id == accountID.userAccountId){
                console.log("ACC-VERIFS-CHK-TKN-4-USR-ACC: GRANTED");
                success = true;
                reason = null;
            } else {
                console.log("ACC-VERIFS-CHK-TKN-4-USR-ACC: FORBIDDEN");
                success = false;
                reason = "FORBIDDEN";
            }
            
        } else {
            
            if(data == "NOT FOUND"){
                console.log("ACC-VERIFS-CHK-TKN-4-USR-ACC: CAN NOT VERIFY USER!");
                reason = "USER NOT FOUND";
            } else {
                console.log("ACC-VERIFS-CHK-TKN-4-USR-ACC: DB ERROR!!!");
                reason = "DB ERROR";
            }
            
            success = false;
        }
        
        callback(success, reason);
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
