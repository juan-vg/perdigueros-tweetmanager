var TwitterPackage = require('twitter');
var WebSocketServer = require('ws');
var twiAccModel = require("./models/twitter-accounts");
var hashtagsModel = require("./models/hashtags");
var follUsModel = require("./models/followed-users");
var accVerificator = require("./account-verifications.js");
var dbVerificator = require("./db-verifications.js");
var mongoose = require("mongoose");
var objectID = require('mongodb').ObjectID;

const wss = new WebSocketServer.Server({ port: 8889 }, function(err){
    if(!err){
        console.log("Servidor escuchando peticiones en el puerto 8889");
    }
});

//database connection
mongoose.connect('mongodb://localhost:27017/ptm');

// global vars
var clients=[];
var numClients = 0;


function streamFunc(index, callback){
	
	var error, tweet;
    
    var twitterAccountId = clients[index].twitterAccountId;
    
    twiAccModel.find({"_id": new objectID(twitterAccountId)}, function(err, dbData){
        if(!err){
            
            // create auth set
            var secret = {
                consumer_key: dbData[0].information.consumerKey,
                consumer_secret: dbData[0].information.consumerSecret,
                access_token_key: dbData[0].information.accessToken,
                access_token_secret: dbData[0].information.accessTokenSecret
            };
            
            var Twitter = new TwitterPackage(secret);
            
            if(clients[index].streamFunc == "hashtags"){
                
                hashtagsModel.find({"twitterAccountId":twitterAccountId}, function(err, dbData){
                    if(!err){
                        
                        var list = [];
                        
                        // generate hashtag list
                        for(var i=0; i<dbData.length; i++){
                            var hashtag = dbData[i].hashtag;
                            hashtag = hashtag.replace("#","");
                            hashtag = hashtag.replace("%23","");
                            
                            hashtag = "%23" + hashtag;
                            
                            list.push(hashtag);
                        }
                        
                        var query = list.join(",");
                        
                        if(query && query.length > 0){
                            
                            // create stream
                            Twitter.stream('statuses/filter', {track: query}, function(stream) {
                            
                                // save stream handler
                                if(!clients[index].stream){
                                    clients[index].stream = stream;
                                }

                                stream.on('data', function(event) {
									tweet = {
										created_at: event.created_at,
										full_name: event.user.name,
										name: event.user.screen_name,
										text: event.text
									};
									error = false;
                                    callback(error, tweet);
                                });

                                stream.on('error', function(error) {
                                    console.log("TWITTER ERROR : " + error);
                                    
                                    tweet = "TWITTER ERROR";
                                    error = true;
                                    callback(error, tweet);
                                });

                            });
                            
                        } else {
                            console.log("EMPTY HASHTAG LIST");
                            tweet = "EMPTY LIST ERROR";
							error = true;
							callback(error, tweet);
                        }
                        
                    } else {
                        console.log("H DB ERROR");
                        tweet = "DB ERROR";
						error = true;
						callback(error, tweet);
                    }
                });
                
            } else {
                
                follUsModel.find({"twitterAccountId":twitterAccountId}, function(err, dbData){
                    if(!err){
                        
                        var list = [];
                        
                        // generate followed users list
                        for(var i=0; i<dbData.length; i++){
                            var userId = dbData[i].userId;
                            list.push(userId);
                        }
                        
                        var query = list.join(",");
                        
                        if(query && query.length > 0){
                            // create stream
                            Twitter.stream('statuses/filter', {follow: query}, function(stream) {
                            
                                // save stream handler
                                if(!clients[index].stream){
                                    clients[index].stream = stream;
                                }

                                stream.on('data', function(event) {
                                    tweet = {
										created_at: event.created_at,
										full_name: event.user.name,
										name: event.user.screen_name,
										text: event.text
									};
									error = false;
                                    callback(error, tweet);
                                });

                                stream.on('error', function(error) {
                                    console.log("TWITTER ERROR " + error);
                                    
                                    tweet = "TWITTER ERROR";
                                    error = true;
                                    callback(error, tweet);
                                });

                            });
                            
                        } else {
                            console.log("EMPTY FOLLOWED LIST");
                            
                            tweet = "EMPTY LIST ERROR";
							error = true;
							callback(error, tweet);
                        }
                        
                    } else {
                        console.log("FU DB ERROR");
                        
                        tweet = "DB ERROR";
						error = true;
						callback(error, tweet);
                    }
                });
            }
            
        } else {
            console.log("TA DB ERROR");
            
            tweet = "DB ERROR";
			error = true;
			callback(error, tweet);
        }
    });
}
module.exports.streamFunc = streamFunc;


// WS impl.
wss.on('connection', function connection(ws, req) {
    
    var strFunc, twitterAccountId;
    
    var url = req.url;
    
    // get stream func from url path
    if(url.endsWith("/hashtags")){
        strFunc="hashtags";
    } else {
        strFunc="followed";
    }
    
    // get twitter account id from url path
    var regexp = /\/twitter-accounts\/(.*)\/tweets\/.*/g;
    var match = regexp.exec(url);
    twitterAccountId = match[1];
    
    // save client
    var c = {
        'ws':ws,
        'stream':null,
        'streamFunc': strFunc,
        'twitterAccountId': twitterAccountId, 
        'validated': false
    };
    clients.push(c);
    var numClient = numClients++;
    
    // define onMessage
    ws.on('message', function incoming(message) {
        
        // search client
        for(var i=0; i<clients.length; i++){
            if(ws === clients[i].ws){
                index = i;
            }
        }
        
        // if exists & not validated yet
        if(index >= 0 && !clients[index].validated){
            
            var twitterAccountId = clients[index].twitterAccountId;
            
            // if it is a validation message
            if(message.search("token:") === 0 && message.length > 6){
                
                var token = message.substr(6);
                console.log("validating token " + token);
                
                // Check if ID is valid
                dbVerificator.verifyDbId(twitterAccountId, function(success){
                    if(success){
                        
                        var accountID = {
                            'token': token,
                            'twitterAccountId': twitterAccountId
                        };
                        
                        // validate token
                        accVerificator.verifyUser(accountID, function(success, data){
                            if(success){
                                console.log("VALIDATION OK");
                                
                                clients[index].validated = true;
                                
                                streamFunc(index, function(err, tweet){
                                        
                                    if(!err){
                                        ws.send(JSON.stringify(tweet));
                                    } else {
										ws.send(tweet);
										ws.close();
									}
                                });
                                
                            } else {
                                console.log("VALIDATION ERROR");
                                ws.send("VALIDATION-ERROR: " + data);
                                ws.close();
                            }
                        });
                    } else {
                        console.log("ID NOT VALID");
                        ws.send("TWITTER ID NOT VALID");
                        ws.close();
                    }
                });
            } else {
                //ignore
            }
        } else {
            //ignore
        }
    });
    
    
    // define onClose
    ws.on('close', function incoming(message) {
        
        var index=-1;
        
        // search client
        for(var i=0; i<clients.length; i++){
            if(ws === clients[i].ws){
                index = i;
            }
        }
        
        // if exists -> close stream & delete
        if(index >= 0){
            if(clients[index].stream){
                clients[index].stream.destroy();
            }
            clients.splice(index, 1);
            numClients--;
        }
    });
});
