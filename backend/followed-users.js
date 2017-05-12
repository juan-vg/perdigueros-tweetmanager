var userModel = require("./models/user-accounts");
var twiAccModel = require("./models/twitter-accounts");
var follUsModel = require("./models/followed-users");
var verificator = require("./account-verifications");
var objectID = require('mongodb').ObjectID;

//Get all followed users
exports.getAll = function(userToken, idAccount, callback){

    var error, data;
    
    // Check if user owns that account
    verificator.verifyUser(accountID, function(success){
        
        if(success){
            
            // Get all followed users that twitterAccountId owns
            follUsModel.find({'twitterAccountId' : accountID.twitterAccountId},
            
                function(err,dbData){
                    
                    if(!err){
                        error = false;
                        
                        // retrieve data
                        if(dbData.length > 0){
                            console.log("FOLLOWED-USERS-GET-ALL: Obtained User:", dbData);
                            data = dbData;
                        } else {
                            
                            //no results
                            console.log("FOLLOWED-USERS-GET-ALL: There is no user information.");
                            data = [];
                        }
                    } else {
                        console.log("FOLLOWED-USERS-GET-ALL: Error while performing query.");
                        
                        error = true;
                        data = "DB ERROR";
                    }
                    callback(error, data);
                }
            );
            
        } else {
            console.log("FOLLOWED-USERS-POST-ID: Forbidden.");
            
            error = true;
            data = "FORBIDDEN";
            
            callback(error, data);
        }
    });
};

//Get a single followed user by ID 
exports.get = function (accountID, user, callback){
    
    var error, data;
    
    // Check if user owns that account
    verificator.verifyUser(accountID, function(success){
        
        if(success){
            
            // Get the specified user if twitterAccountId owns it
            follUsModel.find({'twitterAccountId' : accountID.twitterAccountId, 'user': user},
            
                function(err,dbData){
                    
                    if(!err){
                        
                        // retrieve data
                        if(dbData.length > 0){
                            console.log("FOLLOWED-USERS-GET-ID: ", dbData);
                            
                            error = false;
                            data = dbData;
                        } else {
                            console.log("FOLLOWED-USERS-GET-ID: There is no user information.");
                            
                            error = true;
                            data = "NOT FOUND";
                        }
                    } else {
                        console.log("FOLLOWED-USERS-GET-ALL: Error while performing query.");
                        
                        error = true;
                        data = "DB ERROR";
                    }
                    callback(error, data);
                }
            );
        } else {
            console.log("FOLLOWED-USERS-POST-ID: Forbidden.");
            
            error = true;
            data = "FORBIDDEN";  
            callback(error, data);
        }
    }); 
};

//Create new followed user app.post("/followed-users", function(request, response) {
exports.post = function (accountID, user, callback){
    
    var error, data;
    
    // Check if user owns that account
    verificator.verifyUser(accountID, function(success){
        
        if(success){
            
            // Check if the specified user already exists
            hashtagsModel.find({'twitterAccountId' : accountID.twitterAccountId, 'user': user},
                
                function(err,dbData){
                    
                    if(!err){
                        
                        if(dbData.length > 0){
                            
                            // already exists
                            console.log("FOLLOWED-USERS-POST-ID: User already exists");
                            
                            error = true;
                            data = "ALREADY EXISTS";
                            callback(error, data);
                        } else {
                            
                            // everything ok
                            var dbFollUsers = new follUsersModel();
                            dbFollUsers.twitterAccountId = accountID.twitterAccountId;
                            dbFollUsers.user = user;
                            
                            // save new followed user
                            dbFollUsers.save(function(err, result) {
                                if(!err){
                                    
                                    console.log("FOLLOWED-USERS-POST-ID: Created new followed user");
                                    
                                    error = false;
                                    data = null;
                                    callback(error, data);
                                } else {
                                    console.log("FOLLOWED-USERS-POST-ID: Error while performing query.");
                                    
                                    error = true;
                                    data = "DB ERROR";
                                    callback(error, data);
                                }
                            });
                        }
                    } else {
                        console.log("FOLLOWED-USERS-POST-ID: Error while performing query.");
                        
                        error = true;
                        data = "DB ERROR";
                        callback(error, data);
                    }
                }
            );
        } else {
            console.log("FOLLOWED-USERS-POST-ID: Forbidden.");
            error = true;
            data = "FORBIDDEN";
            callback(error, data);
        }
    });    
};


//Update a followed user app.put("/followed-users/:id", function(request, response) {
exports.put = function(accountID, user, callback){
    
    //TODO
    var error, data;
    error = false;
    data = null;
};


//Delete a followed user app.delete("/followed-users/:id", function(request, response) {
exports.delete = function (accountID, user, callback){
    
    var error, data;
    
    // Check if user owns that account
    verificator.verifyUser(accountID, function(success){
        
        if(success){
            
            // Check if the specified user exists
            follUsersModel.find({'twitterAccountId' : accountID.twitterAccountId, 'user': user},
                
                function(err,dbData){
                    
                    if(!err){
                        
                        if(dbData.length > 0){
                            
                            // existing user -> delete user
                            follUsersModel.remove({'_id': new objectID(dbData[0]._id)}, function(err, result) {
                                if(!err){
                                    error = false;
                                    data = null;
                                    callback(error, data);
                                } else {
                                    error = true;
                                    data = "DB ERROR";
                                    callback(error, data);
                                }
                            });
                        } else {
                            
                            // hashtag does not exist
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