var schedTweetsModel = require("./models/scheduled-tweets");
var accVerificator = require("./account-verifications");
var dbVerificator = require("./db-verifications");
var TwitterPackage = require('twitter');
var objectID = require('mongodb').ObjectID;

exports.publish = function (accountID, text, callback){

    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
		
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, data){
                
                if(success){
					
					// create auth set
					var secret = {
						consumer_key: data.consumerKey,
						consumer_secret: data.consumerSecret,
						access_token_key: data.accessToken,
						access_token_secret: data.accessTokenSecret
					}
					var Twitter = new TwitterPackage(secret);
					
					// publish tweet
					Twitter.post('statuses/update', {status: text}, function(err, tweet, response){
						
						if(!err){
							error = false
							data= null;
						} else {
							console.log("TWEETS-PUBLISH: Twitter error");
							
							error = true;
							data = "TWITTER ERROR";
						}
						
						callback(error, data);
					});
					
					
				} else {
					if(reason == "ACCOUNT NOT FOUND"){
                        console.log("TWEETS-PUBLISH: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                        
                    } else if(reason == "DB ERROR") {
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
            data = "ACCOUNT ID NOT VALID";
            callback(error, data);
		}
	});
}


// schedules the publication of a tweet
// tweetData = {text, date}
exports.schedule = function (accountID, tweetData, callback){

    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
		
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, data){
                
                if(success){
					
					// save scheduled tweet
					dbSchedTweets = new schedTweetsModel();
					
					dbSchedTweets.twitterAccountId = accountID.twitterAccountId;
					dbSchedTweets.text = tweetData.text;
					dbSchedTweets.publishDate = tweetData.date;
					dbSchedTweets.published = false;
					
					dbSchedTweets.save(function(err, res){
						if(!err){
							error = false;
							data = null;
						} else {
							console.log("TWEETS-SCHEDULE: DB ERROR!!!" );

							error = true;
							data = "DB ERROR";
						}
					});
					
				} else {
					if(reason == "ACCOUNT NOT FOUND"){
                        console.log("TWEETS-SCHEDULE: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                        
                    } else if(reason == "DB ERROR") {
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
            data = "ACCOUNT ID NOT VALID";
            callback(error, data);
		}
	});
}
/*
// returns the user timeline (home)
exports.timeline = function (accountID, callback){

    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
		
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, data){
                
                if(success){
					
					// create auth set
					var secret = {
						consumer_key: data.consumerKey,
						consumer_secret: data.consumerSecret,
						access_token_key: data.accessToken,
						access_token_secret: data.accessTokenSecret
					}
					var Twitter = new TwitterPackage(secret);
					
					Twitter.post('statuses/update', {status: text}, function(err, tweet, response){
						
						if(!err){
							error = false
							data= null;
						} else {
							console.log("TWEETS-PUBLISH: Twitter error");
							
							error = true;
							data = "TWITTER ERROR";
						}
						
						callback(error, data);
					});
					
				} else {
					if(reason == "ACCOUNT NOT FOUND"){
                        console.log("TWEETS-SCHEDULE: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                        
                    } else if(reason == "DB ERROR") {
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
			console.log("HASHTAGS-GET-ALL: Account ID is not valid");
            
            error = true;
            data = "ACCOUNT ID NOT VALID";
            callback(error, data);
		}
	});
}

// returns tweets containing mentions to the current twitter-account
exports.mentions = function (accountID, callback){

    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
		
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, data){
                
                if(success){
					
					dbSchedTweets = new schedTweetsModel();
					
					dbSchedTweets.text = tweetData.text;
					dbSchedTweets.publishDate = tweetData.date;
					dbSchedTweets.published = false;
					
					dbSchedTweets.save(function(err, res){
						if(!err){
							error = false;
							data = null;
						} else {
							console.log("TWEETS-SCHEDULE: DB ERROR!!!" );

							error = true;
							data = "DB ERROR";
						}
					});
					
				} else {
					if(reason == "ACCOUNT NOT FOUND"){
                        console.log("TWEETS-SCHEDULE: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                        
                    } else if(reason == "DB ERROR") {
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
			console.log("HASHTAGS-GET-ALL: Account ID is not valid");
            
            error = true;
            data = "ACCOUNT ID NOT VALID";
            callback(error, data);
		}
	});
}

// returns retweeted tweets published by current twitter-account
exports.retweeted = function (accountID, callback){

    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
		
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, data){
                
                if(success){
					
					dbSchedTweets = new schedTweetsModel();
					
					dbSchedTweets.text = tweetData.text;
					dbSchedTweets.publishDate = tweetData.date;
					dbSchedTweets.published = false;
					
					dbSchedTweets.save(function(err, res){
						if(!err){
							error = false;
							data = null;
						} else {
							console.log("TWEETS-SCHEDULE: DB ERROR!!!" );

							error = true;
							data = "DB ERROR";
						}
					});
					
				} else {
					if(reason == "ACCOUNT NOT FOUND"){
                        console.log("TWEETS-SCHEDULE: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                        
                    } else if(reason == "DB ERROR") {
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
			console.log("HASHTAGS-GET-ALL: Account ID is not valid");
            
            error = true;
            data = "ACCOUNT ID NOT VALID";
            callback(error, data);
		}
	});
}

// returns tweets favourited on current twitter-account
exports.favourited = function (accountID, callback){

    var error, data;
    
    // Check if twitter-account ID is valid
    dbVerificator.verifyDbId(accountID.twitterAccountId, function(success){
		
        if(success){
            // check if the token has access to twitterAccountId
            accVerificator.verifyUser(accountID, function(success, data){
                
                if(success){
					
					dbSchedTweets = new schedTweetsModel();
					
					dbSchedTweets.text = tweetData.text;
					dbSchedTweets.publishDate = tweetData.date;
					dbSchedTweets.published = false;
					
					dbSchedTweets.save(function(err, res){
						if(!err){
							error = false;
							data = null;
						} else {
							console.log("TWEETS-SCHEDULE: DB ERROR!!!" );

							error = true;
							data = "DB ERROR";
						}
					});
					
				} else {
					if(reason == "ACCOUNT NOT FOUND"){
                        console.log("TWEETS-SCHEDULE: Twitter account NOT FOUND");

                        error = true;
                        data = "ACCOUNT NOT FOUND";
                        
                    } else if(reason == "DB ERROR") {
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
			console.log("HASHTAGS-GET-ALL: Account ID is not valid");
            
            error = true;
            data = "ACCOUNT ID NOT VALID";
            callback(error, data);
		}
	});
}
*/
