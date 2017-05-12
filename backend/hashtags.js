var hashtagsModel = require("./models/hashtags");
var verificator = require('./account-verifications.js');
var objectID = require('mongodb').ObjectID;


exports.getAll = function (accountID, callback){

    var error, data;
    
    // check if the token has access to twitterAccountId
    verificator.verifyUser(accountID, function(success){
        
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
            error = true;
            data = "FORBIDDEN";
            
            callback(error, data);
        }
    });
};

exports.get = function (accountID, hashtag, callback){
    
    var error, data;
    
    // check if the token has access to twitterAccountId
    verificator.verifyUser(accountID, function(success){
        
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
            error = true;
            data = "FORBIDDEN";
            
            callback(error, data);
        }
    }); 
    
};

exports.post = function (accountID, hashtag, callback){
    
    var error, data;
    
    // check if the token has access to twitterAccountId
    verificator.verifyUser(accountID, function(success){
        
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
            error = true;
            data = "FORBIDDEN";
            
            callback(error, data);
        }
    });     
    
};

exports.put = function (accountID, hashtag, callback){
    
    var error, data;
    error = true;
    data = null;
    callback(error, data);
/*    
 * Function not needed. Wait for more data
 * 
    // check if the token has access to twitterAccountId
    verifyUser(accountID, function(success){
        
        if(success){
            
            // check if the specified hashtag exists
            hashtagsModel.find({'twitterAccountId' : accountID.twitterAccountId, 'hashtag': hashtag},
                
                function(err,dbData){
                    
                    if(!err){
                        
                        if(dbData.length > 0){
                            // existing hashtag -> everything ok
                            var dbHashtags = new hashtagsModel();
                            dbHashtags.twitterAccountId = accountID.twitterAccountId;
                            dbHashtags.hashtag = hashtag;
                            
                            
                            // update hashtag
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

                        } else {
                            // hashtag does not exist
                            error = true;
                            data = "ALREADY EXISTS";
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
*/    
};

exports.delete = function (accountID, hashtag, callback){
    
    var error, data;
    
    // check if the token has access to twitterAccountId
    verificator.verifyUser(accountID, function(success){
        
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
            error = true;
            data = "FORBIDDEN";
            
            callback(error, data);
        }
    });   
    
};
