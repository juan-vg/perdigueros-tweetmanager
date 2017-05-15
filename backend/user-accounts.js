var userAccModel = require("./models/user-accounts");
var verificator = require('./account-verifications.js');
var objectID = require('mongodb').ObjectID;


//ONLY ADMIN
exports.getAll = function (accountID, callback){

    var error, data;
    
    // check if the token has access admin permissions
    verificator.verifyAdmin(accountID, function(success){
        
        if(success){
            
            // get all users (avoiding retrieval of password)
            userAccModel.find({}, {"password":0},
            
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
    
    // check if the token has the needed permissions
    verificator.verifyUser(accountID, function(success){
        
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
            error = true;
            data = "FORBIDDEN";
            
            callback(error, data);
        }
    }); 
    
};

// ADMIN AND THE USER
exports.delete = function (accountID, callback){
    
    var error, data;
    
    // check if the token has the needed permissions
    verificator.verifyUser(accountID, function(success){
        
        if(success){
            
            // check if the specified user exists
            userAccModel.find({'_id' : new objectID(accountID.userAccountId)},
                
                function(err, dbData){
                    
                    if(!err){
                        
                        if(dbData.length > 0){
                            // existing user -> delete user
                            userAccModel.remove({'_id': new objectID(dbData[0]._id)}, function(err, result) {
                                if(!err){
                                    error = false;
                                    data = null;
                                    callback(error, data);
                                    //TODO: guardar usuario (dbData[0]) con activated=false
                                } else {
                                    error = true;
                                    data = "DB ERROR";
                                    callback(error, data);
                                }
                            });

                        } else {
                            // user does not exist
                            error = true;
                            data = "NOT EXIST";
                            callback(error, data);
                        }
                        
                    } else {
                        error = true;
                        data = "DB ERROR";
                        callback(error, data);
                    }
                }
            );
            
        } else {
            error = true;
            data = "FORBIDDEN";
            
            callback(error, data);
        }
    });   
    
};
