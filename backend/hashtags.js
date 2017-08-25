var hashtagsModel = require("./models/hashtags");
var accVerificator = require("./account-verifications");
var dbVerificator = require("./db-verifications");
var objectID = require('mongodb').ObjectID;

//ADMIN BYPASS
exports.getAll = function (accountID, callback){

    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, reason){
                
                if(success){
                    
                    // get all hashtags that twitterAccountId owns
                    hashtagsModel.find({'twitterAccountId' : accountID.twitterAccountId},
                    
                        function(err,dbData){
                            
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
                    
                    if(reason == "ACCOUNT NOT FOUND"){
                        console.log("HASHTAGS-GET-ALL: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                    } else if(reason == "DB ERROR") {
                        console.log("HASHTAGS-GET-ALL: DB ERROR!!!" );

                        error = true;
                        data = "DB ERROR";
                    } else {
                        console.log("HASHTAGS-GET-ALL: User does not own that account");

                        error = true;
                        data = "FORBIDDEN" ;
                    }
                    
                    callback(error, data);
                }
            });
        } else {
            console.log("HASHTAGS-GET-ALL: Account ID is not valid");
            
            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
};

//ADMIN BYPASS
exports.get = function (accountID, hashtag, callback){
    
    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, reason){
                
                if(success){
                    
                    // get the specified hashtag if twitterAccountId owns it
                    hashtagsModel.find({'twitterAccountId' : accountID.twitterAccountId, 'hashtag': hashtag},
                    
                        function(err,dbData){
                            
                            if(!err){
                                
                                // retrieve data
                                if(dbData.length > 0){
                                    error = false;
                                    data = dbData;
                                } else {
                                    error = true;
                                    data = "NOT FOUND";
                                }
                            } else {
                                error = true;
                                data = "DB ERROR";
                            }
                            
                            callback(error, data);
                        }
                    );
                    
                } else {
                    
                    if(reason == "ACCOUNT NOT FOUND"){
                        console.log("HASHTAGS-GET: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                    } else if(reason == "DB ERROR") {
                        console.log("HASHTAGS-GET: DB ERROR!!!" );

                        error = true;
                        data = "DB ERROR";
                    } else {
                        console.log("HASHTAGS-GET: User does not own that account");

                        error = true;
                        data = "FORBIDDEN" ;
                    }
                    
                    callback(error, data);
                }
            }); 
        } else {
            console.log("HASHTAGS-GET-ALL: Account ID is not valid");
            
            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
};

//ADMIN BYPASS
exports.post = function (accountID, hashtag, callback){
    
    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, reason){
                
                if(success){
                    
                    // remove '#' char
                    hashtag = hashtag.replace("#","");
                    hashtag = hashtag.replace("%23","");
                    
                    // check if the specified hashtag already exists
                    hashtagsModel.find({'twitterAccountId' : accountID.twitterAccountId, 'hashtag': hashtag},
                        
                        function(err,dbData){
                            
                            if(!err){
                                
                                if(dbData.length > 0){
                                    // already exists
                                    error = true;
                                    data = "ALREADY EXISTS";
                                    callback(error, data);
                                } else {
                                    // everything ok
                                    var dbHashtags = new hashtagsModel();
                                    dbHashtags.twitterAccountId = accountID.twitterAccountId;
                                    dbHashtags.hashtag = hashtag;
                                    
                                    
                                    // save new hashtag
                                    dbHashtags.save(function(err, result) {
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
                                }
                                
                            } else {
                                error = true;
                                data = "DB ERROR";
                                callback(error, data);
                            }
                        }
                    );
                    
                } else {
                    if(reason == "ACCOUNT NOT FOUND"){
                        console.log("HASHTAGS-POST: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                    } else if(reason == "DB ERROR") {
                        console.log("HASHTAGS-POST: DB ERROR!!!" );

                        error = true;
                        data = "DB ERROR";
                    } else {
                        console.log("HASHTAGS-POST: User does not own that account");

                        error = true;
                        data = "FORBIDDEN" ;
                    }
                    
                    callback(error, data);
                }
            });
        } else {
            console.log("HASHTAGS-GET-ALL: Account ID is not valid");
            
            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
};


//ADMIN BYPASS
exports.delete = function (accountID, hashtag, callback){
    
    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, reason){
                
                if(success){
                    
                    // check if the specified hashtag exists
                    hashtagsModel.find({'twitterAccountId' : accountID.twitterAccountId, 'hashtag': hashtag},
                        
                        function(err,dbData){
                            
                            if(!err){
                                
                                if(dbData.length > 0){
                                    // existing hashtag -> delete hashtag
                                    hashtagsModel.remove({'_id': new objectID(dbData[0]._id)}, function(err, result) {
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
                    if(reason == "ACCOUNT NOT FOUND"){
                        console.log("HASHTAGS-DELETE: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                    } else if(reason == "DB ERROR") {
                        console.log("HASHTAGS-DELETE: DB ERROR!!!" );

                        error = true;
                        data = "DB ERROR";
                    } else {
                        console.log("HASHTAGS-DELETE: User does not own that account");

                        error = true;
                        data = "FORBIDDEN" ;
                    }
                    
                    callback(error, data);
                }
            });
        } else {
            console.log("HASHTAGS-GET-ALL: Account ID is not valid");
            
            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
};
