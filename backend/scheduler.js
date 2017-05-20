var TwitterPackage = require('twitter');
var schedTweetsModel = require("./models/scheduled-tweets");
var twiAccModel = require("./models/twitter-accounts");
var objectID = require('mongodb').ObjectID;
 
exports.update = function(){
    
    console.log("SCHEDULER: Start");
    
    scheduler(function(err, data){
        if(!err){
            //console.log("SCHEDULER: " + data);
        } else {
            //console.log("SCHEDULER-ERROR: " + data);
        }
    });
};

function scheduler(callback){

    var error, data;
    
    schedTweetsModel.find({"published":false, "publishDate": {$lte: new Date()}}, 
        function(err, dbData){
            
            if(!err){
                
                if(dbData.length > 0){
                    
                    for(var i=0; i<dbData.length; i++){
                        
                        var tweetId = dbData[i]._id;
                        var text = dbData[i].text;
                        var twitterAccountId = dbData[i].twitterAccountId;

                        twiAccModel.find({"_id": new objectID(twitterAccountId)}, function(err, dbData2){
                            
                            if(!err){
                                
                                var info = dbData2[0].information;
                            
                                // create auth set
                                var secret = {
                                    consumer_key: info.consumerKey,
                                    consumer_secret: info.consumerSecret,
                                    access_token_key: info.accessToken,
                                    access_token_secret: info.accessTokenSecret
                                };
                                var Twitter = new TwitterPackage(secret);
                                
                                // publish tweet
                                Twitter.post('statuses/update', {status: text}, function(err, tweet, response){
                                    
                                    if(!err){
                                        
                                        // set scheduled tweet as published
                                        schedTweetsModel.update({"_id": new objectID(tweetId)},
                                            {$set: {"published":true}},
                                            function(err, res){
                                                if(!err){
                                                    error = false;
                                                    data = "Published";
                                                } else {
                                                    error = false;
                                                    data = "UPDATE ERROR";
                                                }
                                                callback(error, data);
                                            }
                                        );
                                    } else {                                        
                                        error = true;
                                        data = "TWITTER ERROR: " + err[0].message;
                                        callback(error, data);
                                    }
                                });
                            } else {
                                error = true;
                                data = "DB ERROR";
                                callback(error, data);
                            }
                        });
                    }
                } else {
                    error = false;
                    data = "NO SCHEDULED TWEETS";
                    callback(error, data);
                }
            } else {
                error = true;
                data = "DB ERROR";
                callback(error, data);
            }
        }
    );
}
