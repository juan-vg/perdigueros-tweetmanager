var schedTweetsModel = require("./models/scheduled-tweets");
var accVerificator = require("./account-verifications");
var dbVerificator = require("./db-verifications");
var adminStats = require("./admin-stats.js");
var geoLocator = require("./geo-location.js");
var TwitterPackage = require('twitter');
var objectID = require('mongodb').ObjectID;

exports.publish = function (accountID, text, ip, callback){

    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
        
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, resData){
                
                if(success){
                    
                    // create auth set
                    var secret = {
                        consumer_key: resData.consumerKey,
                        consumer_secret: resData.consumerSecret,
                        access_token_key: resData.accessToken,
                        access_token_secret: resData.accessTokenSecret
                    };
                    var Twitter = new TwitterPackage(secret);
                    
                    // publish tweet
                    Twitter.post('statuses/update', {status: text}, function(err, tweet, response){
                        
                        if(!err){
                            
                            // save stat
                            geoLocator.location(ip, function(err, resData){
                                
                                var country;
                                
                                if(!err){
                                    country = resData;
                                } else {
                                    country = "undefined";
                                }
                                
                                accVerificator.getUser(accountID.token, function(err, data){
                                    if(!err){
                                        var tweetData = {
                                            date: new Date(),
                                            country: country,
                                            accountId: data._id
                                        };
                                        adminStats.saveTweet(tweetData);
                                    }
                                });
                            });

                            error = false;
                            data = null;
                        } else {
                            console.log("TWEETS-PUBLISH: Twitter error: " + JSON.stringify(err));
                            
                            error = true;
                            data = "TWITTER ERROR";
                        }
                        
                        callback(error, data);
                    });
                    
                    
                } else {
                    if(resData == "ACCOUNT NOT FOUND"){
                        console.log("TWEETS-PUBLISH: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                        
                    } else if(resData == "DB ERROR") {
                        console.log("TWEETS-PUBLISH: DB ERROR!!!" );

                        error = true;
                        data = "DB ERROR";
                        
                    } else {
                        console.log("TWEETS-PUBLISH: User does not own that account");

                        error = true;
                        data = "FORBIDDEN" ;
                    }
                    
                    callback(error, data);
                }
                
            });
            
        } else {
            console.log("TWEETS-PUBLISH: Account ID is not valid");
            
            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
};


// schedules the publication of a tweet
// tweetData = {text, date}
exports.schedule = function (accountID, tweetData, ip, callback){

    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
        
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, resData){
                
                if(success){
                    
                    // save scheduled tweet
                    dbSchedTweets = new schedTweetsModel();
                    
                    dbSchedTweets.twitterAccountId = accountID.twitterAccountId;
                    dbSchedTweets.text = tweetData.text;
                    dbSchedTweets.publishDate = tweetData.date;
                    dbSchedTweets.published = false;
                    
                    dbSchedTweets.save(function(err, res){
                        if(!err){
                            
                            geoLocator.location(ip, function(err, resData){
                                
                                var country;
                                
                                if(!err){
                                    country = resData;
                                } else {
                                    country = "undefined";
                                }
                                
                                accVerificator.getUser(accountID.token, function(err, data){
                                    if(!err){
                                        var tweetStatsData = {
                                            date: tweetData.date,
                                            country: country,
                                            userId: data._id
                                        };
                                        adminStats.saveTweet(tweetStatsData);
                                    }
                                });
                            });
                            
                            error = false;
                            data = null;
                        } else {
                            console.log("TWEETS-SCHEDULE: DB ERROR!!!" );

                            error = true;
                            data = "DB ERROR";
                        }
                        callback(error, data);
                    });
                    
                } else {
                    if(resData == "ACCOUNT NOT FOUND"){
                        console.log("TWEETS-SCHEDULE: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                        
                    } else if(resData == "DB ERROR") {
                        console.log("TWEETS-SCHEDULE: DB ERROR!!!" );

                        error = true;
                        data = "DB ERROR";
                        
                    } else {
                        console.log("TWEETS-SCHEDULE: User does not own that account");

                        error = true;
                        data = "FORBIDDEN" ;
                    }
                    
                    callback(error, data);
                }
                
            });
            
        } else {
            console.log("TWEETS-SCHEDULE: Account ID is not valid");
            
            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
};

// returns the user timeline (publihed tweets by the user)
exports.userTimeline = function (accountID, callback){

    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
        
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, resData){
                
                if(success){
                    
                    // create auth set
                    var secret = {
                        consumer_key: resData.consumerKey,
                        consumer_secret: resData.consumerSecret,
                        access_token_key: resData.accessToken,
                        access_token_secret: resData.accessTokenSecret
                    };
                    var Twitter = new TwitterPackage(secret);
                    
                    Twitter.get('statuses/user_timeline', function(err, body){
                        
                        if(!err){
                            error = false;
                            data = [];
                            
                            for(var i=0; i<body.length; i++){
                                
                                var tweet = body[i];
                                data.push(tweet);
                            }
                            
                        } else {
                            console.log("TWEETS-USER-TIMELINE: Twitter error: " + JSON.stringify(err));
                            
                            error = true;
                            data = "TWITTER ERROR";
                        }
                        
                        callback(error, data);
                    });
                    
                } else {
                    if(resData == "ACCOUNT NOT FOUND"){
                        console.log("TWEETS-USER-TIMELINE: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                        
                    } else if(resData == "DB ERROR") {
                        console.log("TWEETS-USER-TIMELINE: DB ERROR!!!" );

                        error = true;
                        data = "DB ERROR";
                        
                    } else {
                        console.log("TWEETS-USER-TIMELINE: User does not own that account");

                        error = true;
                        data = "FORBIDDEN" ;
                    }
                    
                    callback(error, data);
                }
                
            });
            
        } else {
            console.log("TWEETS-USER-TIMELINE: Account ID is not valid");
            
            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
};

// returns the home timeline (published tweets by followed users)
exports.homeTimeline = function (accountID, callback){

    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
        
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, resData){
                
                if(success){
                    
                    // create auth set
                    var secret = {
                        consumer_key: resData.consumerKey,
                        consumer_secret: resData.consumerSecret,
                        access_token_key: resData.accessToken,
                        access_token_secret: resData.accessTokenSecret
                    };
                    var Twitter = new TwitterPackage(secret);
                    
                    Twitter.get('statuses/home_timeline', function(err, body){
                        
                        if(!err){
                            error = false;
                            data = [];
                            
                            for(var i=0; i<body.length; i++){
                                
                                var tweet = body[i];
                                data.push(tweet);
                            }
                            
                        } else {
                            console.log("TWEETS-HOME-TIMELINE: Twitter error: " + JSON.stringify(err));
                            
                            error = true;
                            data = "TWITTER ERROR";
                        }
                        
                        callback(error, data);
                    });
                    
                } else {
                    if(resData == "ACCOUNT NOT FOUND"){
                        console.log("TWEETS-HOME-TIMELINE: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                        
                    } else if(resData == "DB ERROR") {
                        console.log("TWEETS-HOME-TIMELINE: DB ERROR!!!" );

                        error = true;
                        data = "DB ERROR";
                        
                    } else {
                        console.log("TWEETS-HOME-TIMELINE: User does not own that account");

                        error = true;
                        data = "FORBIDDEN" ;
                    }
                    
                    callback(error, data);
                }
                
            });
            
        } else {
            console.log("TWEETS-HOME-TIMELINE: Account ID is not valid");
            
            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
};

// returns the scheduled tweets
exports.scheduled = function (accountID, callback){

    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
        
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, resData){
                
                if(success){
                    
                    schedTweetsModel.find({"twitterAccountId": accountID.twitterAccountId, "published": false}, 
                        function(err, dbData){
                            
                            if(!err){
                                error = false;
                                data = dbData;
                            } else {
                                console.log("TWEETS-SCHEDULED: DB ERROR!!!" );

                                error = true;
                                data = "DB ERROR";
                            }
                            
                            callback(error, data);
                        }
                    );
                    
                } else {
                    if(resData == "ACCOUNT NOT FOUND"){
                        console.log("TWEETS-SCHEDULED: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                        
                    } else if(resData == "DB ERROR") {
                        console.log("TWEETS-SCHEDULED: DB ERROR!!!" );

                        error = true;
                        data = "DB ERROR";
                        
                    } else {
                        console.log("TWEETS-SCHEDULED: User does not own that account");

                        error = true;
                        data = "FORBIDDEN" ;
                    }
                    
                    callback(error, data);
                }
                
            });
            
        } else {
            console.log("TWEETS-SCHEDULED: Account ID is not valid");
            
            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
};

// returns tweets containing mentions to the current twitter-account
exports.mentions = function (accountID, callback){

    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
        
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, resData){
                
                if(success){
                    
                    // create auth set
                    var secret = {
                        consumer_key: resData.consumerKey,
                        consumer_secret: resData.consumerSecret,
                        access_token_key: resData.accessToken,
                        access_token_secret: resData.accessTokenSecret
                    };
                    var Twitter = new TwitterPackage(secret);
                    
                    Twitter.get('statuses/mentions_timeline', function(err, body){
                        
                        if(!err){
                            error = false;
                            data = [];
                            
                            for(var i=0; i<body.length; i++){
                                
                                var tweet = body[i];
                                data.push(tweet);
                            }
                            
                        } else {
                            console.log("TWEETS-MENTIONS: Twitter error: " + JSON.stringify(err));
                            
                            error = true;
                            data = "TWITTER ERROR";
                        }
                        
                        callback(error, data);
                    });
                    
                } else {
                    if(resData == "ACCOUNT NOT FOUND"){
                        console.log("TWEETS-MENTIONS: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                        
                    } else if(resData == "DB ERROR") {
                        console.log("TWEETS-MENTIONS: DB ERROR!!!" );

                        error = true;
                        data = "DB ERROR";
                        
                    } else {
                        console.log("TWEETS-MENTIONS: User does not own that account");

                        error = true;
                        data = "FORBIDDEN" ;
                    }
                    
                    callback(error, data);
                }
                
            });
            
        } else {
            console.log("TWEETS-MENTIONS: Account ID is not valid");
            
            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
};

// returns retweeted tweets published by current twitter-account
exports.retweeted = function (accountID, callback){

    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
        
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, resData){
                
                if(success){
                    
                    // create auth set
                    var secret = {
                        consumer_key: resData.consumerKey,
                        consumer_secret: resData.consumerSecret,
                        access_token_key: resData.accessToken,
                        access_token_secret: resData.accessTokenSecret
                    };
                    var Twitter = new TwitterPackage(secret);
                    
                    Twitter.get('statuses/retweets_of_me', function(err, body){
                        
                        if(!err){
                            error = false;
                            data = [];
                            
                            for(var i=0; i<body.length; i++){
                                
                                if(body[i].favorited && body[i].favorite_count > 1 || !body[i].favorited && body[i].favorite_count > 0){
                                    var tweet = body[i];
                                    data.push(tweet);
                                }
                            }
                            
                        } else {
                            console.log("TWEETS-RETWEETED: Twitter error: " + JSON.stringify(err));
                            
                            error = true;
                            data = "TWITTER ERROR";
                        }
                        
                        callback(error, data);
                    });
                    
                } else {
                    if(resData == "ACCOUNT NOT FOUND"){
                        console.log("TWEETS-RETWEETED: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                        
                    } else if(resData == "DB ERROR") {
                        console.log("TWEETS-RETWEETED: DB ERROR!!!" );

                        error = true;
                        data = "DB ERROR";
                        
                    } else {
                        console.log("TWEETS-RETWEETED: User does not own that account");

                        error = true;
                        data = "FORBIDDEN" ;
                    }
                    
                    callback(error, data);
                }
                
            });
            
        } else {
            console.log("TWEETS-RETWEETED: Account ID is not valid");
            
            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
};

// returns tweets favorited on current twitter-account
exports.favorited = function (accountID, callback){

    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
        
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, resData){
                
                if(success){
                    
                    // create auth set
                    var secret = {
                        consumer_key: resData.consumerKey,
                        consumer_secret: resData.consumerSecret,
                        access_token_key: resData.accessToken,
                        access_token_secret: resData.accessTokenSecret
                    };
                    var Twitter = new TwitterPackage(secret);
                    
                    Twitter.get('favorites/list', function(err, body){
                        
                        if(!err){
                            error = false;
                            data = [];
                            
                            for(var i=0; i<body.length; i++){
                                
                                if(body[i].favorited && body[i].favorite_count > 1 || !body[i].favorited && body[i].favorite_count > 0){
                                    
                                    var tweet = body[i];
                                    data.push(tweet);
                                }
                            }
                            
                        } else {
                            console.log("TWEETS-FAVORITED: Twitter error: " + JSON.stringify(err));
                            
                            error = true;
                            data = "TWITTER ERROR";
                        }
                        
                        callback(error, data);
                    });
                    
                } else {
                    if(resData == "ACCOUNT NOT FOUND"){
                        console.log("TWEETS-FAVORITED: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                        
                    } else if(resData == "DB ERROR") {
                        console.log("TWEETS-FAVORITED: DB ERROR!!!" );

                        error = true;
                        data = "DB ERROR";
                        
                    } else {
                        console.log("TWEETS-FAVORITED: User does not own that account");

                        error = true;
                        data = "FORBIDDEN" ;
                    }
                    
                    callback(error, data);
                }
                
            });
            
        } else {
            console.log("TWEETS-FAVORITED: Account ID is not valid");
            
            error = true;
            data = "ID NOT VALID";
            callback(error, data);
        }
    });
};
