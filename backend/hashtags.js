var usersModel = require("./models/user-accounts");
var twiAccModel = require("./models/twitter-accounts");
var hashtagsModel = require("./models/hashtags");

var objectID = require('mongodb').ObjectID;


//accountID {token, idTwitterAcount}

function getUserEmail(token, callback){
    
    var error, data;
    
    // get user from token
    usersModel.find({"token" : token }, function(err, dbData) {
        if(!err && dbData.length > 0){
            console.log("HASHTAGS-GET-USER-EMAIL: token: " + token + " -> email: " + dbData[0].email);
            error = false;
            data = dbData[0].email;
        } else {
            console.log("HASHTAGS-GET-USER-EMAIL: NOT FOUND!!!");
            error = true;
            data = null;
        }
        callback(error, data);
    });
}

function verifyUser(accountID, callback){
    
    var success;
    
    // get user email from token
    getUserEmail(accountID.token, function(error, email){
            
            if(!error){
                
                // check if the email matchs the twitterAccountId
                twiAccModel.find({"email" : email, "_id" : accountID.twitterAccountId},
                    
                    function(err,dbData){
                        
                        if(!err && dbData.length > 0){
                            console.log("HASHTAGS-VERIFY-USER: email: " + email + " owns TwitterAccount: " + accountID.twitterAccountId);
                            success = true;
                        } else {
                            console.log("HASHTAGS-VERIFY-USER: email: " + email + " does NOT owns TwitterAccount: " + accountID.twitterAccountId);
                            success = false;
                        }
                        
                        callback(success);
                    }
                );
                
            } else {
                console.log("HASHTAGS-VERIFY-USER: DB ERROR!!!");
                success = false;
                
                callback(success);
            }
        }
    );
}

exports.getAll = function (accountID, callback){

    var error, data;
    
    // check if the token has access to twitterAccountId
    verifyUser(accountID, function(success){
        
        if(success){
            
            // get all hashtags that twitterAccountId owns
            hashtagsModel.find({'twitterAccountId' : accountID.twitterAccountId},
            
                function(err,dbData){
                    
                    if(!err){
                        error = false;
                        
                        if(dbData.length > 0){
                            data = dbData;
                        } else {
                            //no results
                            data = '{[]}';
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

exports.get = function (accountID, hashtag, callback){
    
    var error, data;
    
    // check if the token has access to twitterAccountId
    verifyUser(accountID, function(success){
        
        if(success){
            
            // get the specified hashtag if twitterAccountId owns it
            hashtagsModel.find({'twitterAccountId' : accountID.twitterAccountId, 'hashtag': hashtag},
            
                function(err,dbData){
                    
                    if(!err){
                        
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
            error = true;
            data = "FORBIDDEN";
            
            callback(error, data);
        }
    }); 
    
};

exports.post = function (accountID, hashtag, callback){
    
    var error, data;
    
    // check if the token has access to twitterAccountId
    verifyUser(accountID, function(success){
        
        if(success){
            
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
                            
                            var dbHashtags = new hashtagsModel();
                            dbHashtags.twitterAccountId = accountID.twitterAccountId;
                            dbHashtags.hashtag = hashtag;
                            
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
            error = true;
            data = "FORBIDDEN";
            
            callback(error, data);
        }
    });     
    
};

exports.put = function (accountID, hashtag, callback){
    
    var error;
    
    
};

exports.delete = function (accountID, hashtag, callback){
    
    var error;
    
    
};
