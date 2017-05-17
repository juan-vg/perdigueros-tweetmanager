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
					
					Twitter.post('statuses/update', {status: text},  function(err, tweet, response) {
						
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
			console.log("HASHTAGS-GET-ALL: Account ID is not valid");
            
            error = true;
            data = "ACCOUNT ID NOT VALID";
            callback(error, data);
		}
	});
}
