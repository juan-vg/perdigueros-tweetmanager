var userModel = require("./models/user-accounts");
var twiAccModel = require("./models/twitter-accounts");
var accVerificator = require("./account-verifications");
var dbVerificator = require("./db-verifications");
var objectID = require('mongodb').ObjectID;


//Get all twitter accounts
//ADMIN BYPASS
exports.getAll = function(userToken, callback){
    var error, result;

    //console.log("TWITTER-ACCOUNTS-GET-ALL: Checking database...");
    
    var accountID = {
        'token': userToken,
        'lookingForEmail': true
    };
    
    // Find user email and get twitter accounts
    accVerificator.verifyUser(accountID, function(success, data){

        if(success){
            
            var query;
            
            if(data == "ADMIN"){
                query = {};
            } else {
                query = {'email': data};
            }
            
            twiAccModel.find(query, function(err, res){
                if(!err){
                    console.log("TWITTER-ACCOUNTS-GET-ALL: Obtained User: ", data);
                    console.log("TWITTER-ACCOUNTS-GET-ALL: Accounts in database: ", res.length);
                    
                    error = false;
                    
                    // retrieve data
                    if(res.length > 0){
                        result = res;
                    } else {
                        //no results
                        result = [];
                    }
                } else {
                    error = true;
                    result = "DB ERROR";
                }
                                
                callback(error, result);
            });
            
        } else {            
            if(data == "DB ERROR"){
                console.log("TWITTER-ACCOUNTS-GET-ALL: Error while performing query.");

                error = true;
                result = "DB ERROR";
            } else {
                console.log("TWITTER-ACCOUNTS-GET-ALL: There is no user with this token.");

                error = true;
                result = "FORBIDDEN";
            }
            
            callback(error, result);
        }
    });
};

//Get a single account by ID
//ADMIN BYPASS
exports.getAccount = function(idAccount, userToken, callback){
    var error, result;
    
    // Check if ID is valid
    dbVerificator.verifyDbId(idAccount, function(success){
        if(success){
            
            var accountID = {
                'token': userToken,
                'twitterAccountId': idAccount
            };
            
            // Check if user owns that account
            accVerificator.verifyUser(accountID, function(success, reason){
                if(success){
                    
                    // Find twitter account
                    twiAccModel.findById(idAccount, function(err, res){
                        //console.log("TWITTER-ACCOUNTS-GET-ID: Checking database...");

                        if(!err){
                            console.log("TWITTER-ACCOUNTS-GET-ID: Account: ", res._id);

                            error = false;
                            result = res;
                        } else {
                            console.log("TWITTER-ACCOUNTS-GET-ID: Error while performing query" );

                            error = true;
                            result = "DB ERROR";
                        }
                        callback(error, result);
                    });
                    
                } else {
                    
                    if(reason == "ACCOUNT NOT FOUND"){
                        console.log("TWITTER-ACCOUNTS-GET-ID: There is NO account with id=", idAccount );

                        error = true;
                        result = "NOT FOUND";
                    } else if(reason == "DB ERROR") {
                        console.log("TWITTER-ACCOUNTS-GET-ID: Error while performing query" );

                        error = true;
                        result = "DB ERROR";
                    } else {
                        console.log("TWITTER-ACCOUNTS-GET-ID: User does not own that account");

                        error = true;
                        result = "FORBIDDEN" ;
                    }
                    
                    callback(error, result);
                }
            });
            
        } else {
            console.log("TWITTER-ACCOUNTS-GET-ID: ID account is not valid");
            
            error = true;
            result = "ID NOT VALID";
            callback(error, result);
        }
    });
};

//Create new account
exports.postAccount = function(userToken, newAccount, callback){
    var error, result;  
    console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Trying to create new account: ", newAccount);

    accVerificator.getUserEmail(userToken, function(err, data){
        if(!err) {

            // Check if the account already exists
            twiAccModel.find({"information": newAccount.information}, function(err,res){
                if(!err){
                    if(res !== null && res.length > 0){
                        console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Account already exists");

                        error = true;
                        result = "EXIST";
                        callback(error, result);

                    } else {
                        console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Account does not exist. Adding...");

                        // Add the account to the collection
                        var dbTwitterAccounts = new twiAccModel();
                        dbTwitterAccounts.information = newAccount.information;
                        dbTwitterAccounts.description = newAccount.description;
                        dbTwitterAccounts.email = data;
                        dbTwitterAccounts.activated = true;

                        // Insert new data into DB
                        dbTwitterAccounts.save(function(err, res){
                            console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: New account saved: ", res._id);

                            if (!err) {
                                console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Last inserted account ID: ", res._id);
                                error = false;
                                result = res._id;

                            } else {
                                console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Error while saving account.");
                                error = true;
                                result = "DB ERROR";

                            }
                            callback(error, result);
                        });
                    }
                } else {
                    console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: Error while performing query.");

                    error = true;
                    result = "DB ERROR";
                    callback(error, result);
                }
            });
        } else {
            if(data == "NOT FOUND"){
                console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: User can not be verified");
                error = true;
                result = "FORBIDDEN";
            } else {
                console.log("TWITTER-ACCOUNTS-POST-ACCOUNT: DB error");
                error = true;
                result = "DB ERROR";
            }
            
            callback(error, result);
        }
    });
};

//delete account
//ADMIN BYPASS
exports.deleteAccount = function(userToken, idAccount, callback){
    var error, result;
    
    // Check if ID is valid
    dbVerificator.verifyDbId(idAccount, function(success){
        if(success){
            
            var accountID = {
                'token': userToken,
                'twitterAccountId': idAccount
            };
            
            // Check if the account belongs to the user
            accVerificator.verifyUser(accountID, function(success, reason){
                if(success){
                    
                    // Disable account
                    twiAccModel.update({"_id" : new objectID(idAccount)},{$set : {"activated":false}},
                        function(err, res){
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
                        }
                    );
                    
                } else {
                    
                    if(reason == "ACCOUNT NOT FOUND"){
                        console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: There is NO account with id=", idAccount );

                        error = true;
                        result = "NOT FOUND";
                    } else if(reason == "DB ERROR") {
                        console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: Error while performing query" );

                        error = true;
                        result = "DB ERROR";
                    } else {
                        console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: User does not own that account");

                        error = true;
                        result = "FORBIDDEN" ;
                    }
 
                    callback(error, result);
                }
            });
            
        } else {
            console.log("TWITTER-ACCOUNTS-DEL-ACCOUNT: ID account is not valid");
            
            error = true;
            result = "ID NOT VALID";
            callback(error, result);
        }
    });
};
