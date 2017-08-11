var follUsModel = require("./models/followed-users");
var accVerificator = require("./account-verifications");
var dbVerificator = require("./db-verifications");
var TwitterPackage = require('twitter');
var objectID = require('mongodb').ObjectID;

//Get all followed users
exports.getAll = function(accountID, callback){

    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
        if(success){

            // Check if user owns that account
            accVerificator.verifyUser(accountID, function(success){

                if(success){

                    // Get all followed users that twitterAccountId owns
                    follUsModel.find({'twitterAccountId' : accountID.twitterAccountId},
                            function(err,dbData){

                        if(!err){
                            error = false;

                            //Retrieve data
                            if(dbData.length > 0){
                                console.log("FOLLOWED-USERS-GET-ALL: Obtained User:", dbData);
                                data = dbData;
                            } else {

                                // No results
                                console.log("FOLLOWED-USERS-GET-ALL: There is no user information.");
                                data = [];
                            }
                        } else {
                            console.log("FOLLOWED-USERS-GET-ALL: Error while performing query.");

                            error = true;
                            data = "DB ERROR";
                        }
                        callback(error, data);
                    });
                } else {
                    console.log("FOLLOWED-USERS-GET-ALL: Forbidden.");

                    error = true;
                    data = "FORBIDDEN";
                    callback(error, data);
                }
            });
        } else {
            console.log("FOLLOWED-USERS-GET-ALL: Account ID is not valid");

            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
};

//Get a single followed user by ID 
exports.get = function (accountID, user, callback){

    var error, data;

    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
        if(success){ 
            
            // Check if user owns that account
            accVerificator.verifyUser(accountID, function(success){

                if(success){

                    // Get the specified user if twitterAccountId owns it
                    follUsModel.find({'twitterAccountId' : accountID.twitterAccountId, 'user': user}, function(err,dbData){

                        if(!err){

                            // Retrieve data
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
                            console.log("FOLLOWED-USERS-GET-ID: Error while performing query.");

                            error = true;
                            data = "DB ERROR";
                        }
                        callback(error, data);
                    }
                    );
                } else {
                    console.log("FOLLOWED-USERS-GET-ID: Forbidden.");

                    error = true;
                    data = "FORBIDDEN";  
                    callback(error, data);
                }
            }); 
        } else {
            console.log("FOLLOWED-USERS-GET-ID: Account ID is not valid");

            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });

};

//Create new followed user app.post("/followed-users", function(request, response) {
exports.post = function (accountID, user, callback){

    var error, data;

    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
        if(success){ 
            
            // Check if user owns that account
            accVerificator.verifyUser(accountID, function(success, result){

                if(success){

                    // Check if the specified user already exists
                    follUsModel.find({'twitterAccountId' : accountID.twitterAccountId, 'user': user}, function(err,dbData){

                        if(!err){
                            if(dbData.length > 0){

                                // Already exists
                                console.log("FOLLOWED-USERS-POST-ID: User already exists");

                                error = true;
                                data = "ALREADY EXISTS";
                                callback(error, data);
                            } else {
                                
                                // create auth set
                                var secret = {
                                    consumer_key: result.consumerKey,
                                    consumer_secret: result.consumerSecret,
                                    access_token_key: result.accessToken,
                                    access_token_secret: result.accessTokenSecret
                                };
                                var Twitter = new TwitterPackage(secret);
                                
                                // get twitter user id
                                Twitter.get('users/lookup', {screen_name: user.replace("@","")}, function(err, body){
                                    if(!err){
                                        
                                        // Everything ok
                                        var dbFollUsers = new follUsModel();
                                        dbFollUsers.twitterAccountId = accountID.twitterAccountId;
                                        dbFollUsers.user = user;
                                        dbFollUsers.userId = body[0].id_str;

                                        // Save new followed user
                                        dbFollUsers.save(function(err, result) {
                                            if(!err){

                                                console.log("FOLLOWED-USERS-POST-ID: Created new followed user");

                                                error = false;
                                                data = null;
                                            } else {
                                                console.log("FOLLOWED-USERS-POST-ID: Error while performing query.");

                                                error = true;
                                                data = "DB ERROR";
                                            }
                                            callback(error, data);
                                        });
                                    } else {
                                        console.log("FOLLOWED-USERS-POST-ID: Twitter error: " + JSON.stringify(err));
                                        
                                        error = true;
                                        data = "TWITTER ERROR";
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
                    });
                } else {
                    console.log("FOLLOWED-USERS-POST-ID: Forbidden.");

                    error = true;
                    data = "FORBIDDEN";
                    callback(error, data);
                }
            }); 
        } else {
            console.log("FOLLOWED-USERS-POST-ID: Account ID is not valid");

            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
};

//Delete a followed user app.delete("/followed-users/:id", function(request, response) {
exports.delete = function (accountID, user, callback){

    var error, data;

    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
        if(success){ 

            // Check if user owns that account
            accVerificator.verifyUser(accountID, function(success){

                if(success){

                    // Check if the specified user exists
                    follUsModel.find({'twitterAccountId' : accountID.twitterAccountId, 'user': user}, function(err,dbData){

                        if(!err){
                            if(dbData.length > 0){
                                
                                // Existing followed user -> delete followed user
                                console.log("FOLLOWED-USERS-DELETE-ID: User already exists. Deleting...");
                                
                                follUsModel.remove({'_id': new objectID(dbData[0]._id)}, function(err, result) {
                                    if(!err){
                                        error = false;
                                        data = null;
                                    } else {
                                        error = true;
                                        data = "DB ERROR";
                                    }
                                    callback(error, data);
                                });
                            } else {

                                // Followed user does not exist
                                console.log("FOLLOWED-USERS-DELETE-ID: User does not exist.");
                                
                                error = true;
                                data = "NOT EXIST";
                                callback(error, data);
                            }
                        } else {
                            console.log("FOLLOWED-USERS-DELETE-ID: Error while performing query.");
                            
                            error = true;
                            data = "DB ERROR";
                            callback(error, data);
                        }
                    });
                } else {
                    console.log("FOLLOWED-USERS-DELETE-ID: Forbidden.");
                    
                    error = true;
                    data = "FORBIDDEN";
                    callback(error, data);
                }
            });   
        } else {
            console.log("FOLLOWED-USERS-DELETE-ID: Account ID is not valid");

            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
};
