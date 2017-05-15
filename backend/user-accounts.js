var userAccModel = require("./models/user-accounts");
var accVerificator = require('./account-verifications.js');
var dbVerificator = require('./db-verifications.js');
var crypto = require('crypto');
var objectID = require('mongodb').ObjectID;


//ONLY ADMIN
exports.getAll = function (accountID, callback){

    var error, data;
    
    // check if the token has access admin permissions
    accVerificator.verifyAdmin(accountID, function(success, reason){
        
        if(success){
            
            // get all users (avoiding retrieval of password)
            userAccModel.find({"activated": true}, {"password":0},
            
                function(err, dbData){
                    
                    if(!err){
                        error = false;
                        
                        // retrieve data
                        if(dbData.length > 0){
                            data = dbData;
                        } else {
                            //no results
                            data = [];
                        }
                    } else {
                        error = true;
                        data = "DB ERROR";
                    }
                    
                    callback(error, data);
                }
            );
            
        } else {
            error = true;
            data = "FORBIDDEN";
            
            callback(error, data);
        }
    });
};

// ADMIN AND THE USER
exports.get = function (accountID, callback){
    
    var error, data;
    
    // Check if ID is valid
    dbVerificator.verifyDbId(accountID.userAccountId, function(success){
        if(success){
            
            // check if the token has the needed permissions
            accVerificator.verifyUser(accountID, function(success, reason){
                
                if(success){
                    
                    // get the specified user (avoiding retrieval of password)
                    userAccModel.find({'_id' : new objectID(accountID.userAccountId)}, {"password":0},
                    
                        function(err, dbData){
                            
                            if(!err && dbData.length > 0){
                                
                                // retrieve data
                                error = false;
                                data = dbData;

                            } else {
                                error = true;
                                data = "DB ERROR";
                            }
                            
                            callback(error, data);
                        }
                    );
                    
                } else {
                    if(reason == "USER NOT FOUND"){
                        console.log("USER-ACC-GET: User account NOT FOUND");

                        error = true;
                        data = "USER NOT FOUND";
                    } else if(reason == "DB ERROR") {
                        console.log("USER-ACC-GET: DB ERROR!!!" );

                        error = true;
                        data = "DB ERROR";
                    } else {
                        console.log("USER-ACC-GET: User has NOT permissions");

                        error = true;
                        data = "FORBIDDEN" ;
                    }
                    
                    callback(error, data);
                }
            });
            
        } else {
            console.log("USER-ACC-GET-ID: ID account is not valid");
            
            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
};

// ONLY THE USER
// Update passwd
exports.put = function (accountID, passwordSet, callback){

    var error, data;
    
    // Check if ID is valid
    dbVerificator.verifyDbId(accountID.userAccountId, function(success){
        if(success){
    
            // check if the token has the needed permissions
            accVerificator.verifyUser(accountID, function(success, reason){
                
                if(success){
                    
                    var oldPasswd = crypto.createHash('sha256').update(passwordSet.oldPasswd).digest('base64');
                    
                    // check if the specified user exists
                    // check if the OLD passwd matches the one in the DB
                    userAccModel.find({'_id' : new objectID(accountID.userAccountId), 'password': oldPasswd},
                        
                        function(err, dbData){
                            
                            if(!err){
                                
                                if(dbData.length > 0){
                                    
                                    var newPasswd = crypto.createHash('sha256').update(passwordSet.newPasswd).digest('base64');
                                    
                                    // existing user & correct passwd-> update passwd
                                    userAccModel.update({"_id" : new objectID(accountID.userAccountId)},{$set : {"password": newPasswd}},
                                        function(err, res){
                                            if(!err){
                                                error = false;
                                                result = null;
                                            } else {
                                                error = true;
                                                result = "DB ERROR";
                                            }
                                            callback(error, data);
                                        }
                                    );

                                } else {
                                    console.log("USER-ACC-PUT: OLD Passwd does NOT match");
                                    
                                    error = true;
                                    data = "INCORRECT PASSWD";
                                    callback(error, data);
                                }
                                
                            } else {
                                console.log("USER-ACC-PUT: DB ERROR!!!" );
                                
                                error = true;
                                data = "DB ERROR";
                                callback(error, data);
                            }
                        }
                    );
                    
                } else {
                    if(reason == "USER NOT FOUND"){
                        console.log("USER-ACC-PUT: User account NOT FOUND");

                        error = true;
                        data = "USER NOT FOUND";
                    } else if(reason == "DB ERROR") {
                        console.log("USER-ACC-PUT: DB ERROR!!!" );

                        error = true;
                        data = "DB ERROR";
                    } else {
                        console.log("USER-ACC-PUT: User has NOT permissions");

                        error = true;
                        data = "FORBIDDEN" ;
                    }
                    
                    callback(error, data);
                }
            });
             
        } else {
            console.log("USER-ACC-PUT: ID account is not valid");
            
            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
}

// ADMIN AND THE USER
exports.delete = function (accountID, callback){
    
    var error, data;
    
    // Check if ID is valid
    dbVerificator.verifyDbId(accountID.userAccountId, function(success){
        if(success){
    
            // check if the token has the needed permissions
            accVerificator.verifyUser(accountID, function(success, reason){
                
                if(success){
                    
                    // check if the specified user exists
                    //   - Not needed (because verifyUser) if the token is owned by the user
                    //   - Needed if the token is owned by the ADMIN
                    userAccModel.find({'_id' : new objectID(accountID.userAccountId)},
                        
                        function(err, dbData){
                            
                            if(!err){
                                
                                if(dbData.length > 0){
                                    // existing user -> delete (disable) user
                                    userAccModel.update({"_id" : new objectID(accountID.userAccountId)},{$set : {"activated":false}},
                                        function(err, res){
                                            if(!err){
                                                error = false;
                                                result = null;
                                            } else {
                                                error = true;
                                                result = "DB ERROR";
                                            }
                                            callback(error, data);
                                        }
                                    );

                                } else {
                                    // user does not exist
                                    console.log("USER-ACC-DELETE: User account NOT FOUND");
                                    
                                    error = true;
                                    data = "USER NOT FOUND";
                                    callback(error, data);
                                }
                                
                            } else {
                                console.log("USER-ACC-DELETE: DB ERROR!!!" );
                                
                                error = true;
                                data = "DB ERROR";
                                callback(error, data);
                            }
                        }
                    );
                    
                } else {
                    if(reason == "USER NOT FOUND"){
                        console.log("USER-ACC-DELETE: User account NOT FOUND");

                        error = true;
                        data = "USER NOT FOUND";
                    } else if(reason == "DB ERROR") {
                        console.log("USER-ACC-DELETE: DB ERROR!!!" );

                        error = true;
                        data = "DB ERROR";
                    } else {
                        console.log("USER-ACC-DELETE: User has NOT permissions");

                        error = true;
                        data = "FORBIDDEN" ;
                    }
                    
                    callback(error, data);
                }
            });
              
        } else {
            console.log("USER-ACC-GET-ID: ID account is not valid");
            
            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
};
