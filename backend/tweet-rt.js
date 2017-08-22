var TwitterPackage = require('twitter');
var WebSocketServer = require('ws');
var twiAccModel = require("./models/twitter-accounts");
var hashtagsModel = require("./models/hashtags");
var follUsModel = require("./models/followed-users");
var accVerificator = require("./account-verifications.js");
var dbVerificator = require("./db-verifications.js");
var mongoose = require("mongoose");
var objectID = require('mongodb').ObjectID;
var HashMap = require('hashmap');

const SERVER_PORT = 8889;

const wss = new WebSocketServer.Server({ port: SERVER_PORT }, function(err){
    if(!err){
        console.log("Backend RT server listening on port %s...", SERVER_PORT);
    }
});

//database connection
mongoose.connect('mongodb://localhost:27017/ptm');

// global vars
var clients = new HashMap();


function streamFunc(client, callback){
    
    var error, tweet;
    
    var twitterAccountId = client.twitterAccountId;
    
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
            
            if(client.streamFunc == "hashtags"){
                
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
                                if(!client.stream){
                                    client.stream = stream;
                                    clients.set(client.ws, client);
                                }

                                stream.on('data', function(event) {
                                    tweet = {
                                        id_str: event.id_str
                                    };
                                    error = false;
                                    callback(error, tweet);
                                });

                                stream.on('error', function(error) {
                                    console.log(">> [RT]: TWITTER ERROR : " + error);
                                    
                                    tweet = "TWITTER ERROR";
                                    error = true;
                                    callback(error, tweet);
                                });

                            });
                            
                        } else {
                            console.log(">> [RT]: EMPTY HASHTAG LIST");
                            tweet = "EMPTY LIST ERROR";
                            error = true;
                            callback(error, tweet);
                        }
                        
                    } else {
                        console.log(">> [RT]: Hashtags DB ERROR");
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
                            userId = userId.replace("@","");
                            userId = userId.replace("%40","");
                            
                            list.push(userId);
                        }
                        
                        var query = list.join(",");
                        
                        if(query && query.length > 0){
                            // create stream
                            Twitter.stream('statuses/filter', {follow: query}, function(stream) {
                            
                                // save stream handler
                                if(!client.stream){
                                    client.stream = stream;
                                    clients.set(client.ws, client);
                                }

                                stream.on('data', function(event) {
                                    tweet = {
                                        id_str: event.id_str
                                    };
                                    error = false;
                                    callback(error, tweet);
                                });

                                stream.on('error', function(error) {
                                    console.log(">> [RT]: TWITTER ERROR " + error);
                                    
                                    tweet = "TWITTER ERROR";
                                    error = true;
                                    callback(error, tweet);
                                });

                            });
                            
                        } else {
                            console.log(">> [RT]: EMPTY FOLLOWED LIST");
                            
                            tweet = "EMPTY LIST ERROR";
                            error = true;
                            callback(error, tweet);
                        }
                        
                    } else {
                        console.log(">> [RT]: FollowedUsers DB ERROR");
                        
                        tweet = "DB ERROR";
                        error = true;
                        callback(error, tweet);
                    }
                });
            }
            
        } else {
            console.log(">> [RT]: TwitterAccounts DB ERROR");
            
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
    if(match && match[1]){
        twitterAccountId = match[1];
    } else {
        twitterAccountId = null;
    }
    
    console.log(">> [RT]: NEW CONNECTION (TwAcc: " + twitterAccountId + ", Func: " + strFunc + ")");
    
    // save client
    var c = {
        'ws':ws,
        'stream':null,
        'streamFunc': strFunc,
        'twitterAccountId': twitterAccountId, 
        'validated': false
    };
    clients.set(ws, c);
    
    var util = require('util');
    
    //console.log("SET: " + JSON.stringify(util.inspect(ws)));
    //console.log("------------------------------------");
    
    // define onMessage
    ws.on('message', function incoming(message) {
        
        var client = clients.get(ws);
        
        // if exists & not validated yet
        if(client && !client.validated){
            
            var twitterAccountId = client.twitterAccountId;
            
            // if it is a validation message
            if(message.search("token:") === 0 && message.length > 6){
                
                var token = message.substr(6);
                
                var censoredToken;
        
                if(token && token.length > 10){
                    censoredToken = "**********" + token.substr(10);
                } else {
                    censoredToken = token;
                }
                
                console.log(">> [RT]: validating token " + censoredToken);
                
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
                                console.log(">> [RT]: VALIDATION OK");
                                
                                client.validated = true;
                                clients.set(client.ws, client);
                                
                                streamFunc(client, function(err, tweet){
                                        
                                    if(!err){
                                        ws.send(JSON.stringify(tweet), function ack(error) {
                                            if(error){
                                                console.log(">> [RT]: ERROR: Closed socket");
                                                ws.close();
                                            }
                                        });
                                    } else {
                                        ws.send(tweet, function ack(error) {
                                            if(error){
                                                console.log(">> [RT]: ERROR: Closed socket");
                                            }
                                        });
                                        ws.close();
                                    }
                                });
                                
                            } else {
                                console.log(">> [RT]: VALIDATION ERROR");
                                ws.send("VALIDATION-ERROR: " + data, function ack(error) {
                                    if(error){
                                        console.log(">> [RT]: ERROR: Closed socket");
                                    }
                                });
                                ws.close();
                            }
                        });
                    } else {
                        console.log(">> [RT]: TWITTER ID NOT VALID");
                        ws.send("TWITTER ID NOT VALID", function ack(error) {
                            if(error){
                                console.log(">> [RT]: ERROR: Closed socket");
                            }
                        });
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
        
        var client = clients.get(ws);
        
        // if exists -> close stream & delete
        if(client){
            if(client.stream){
                client.stream.destroy();
            }
            console.log(">> [RT]: CLOSED CONNECTION (TwAcc: " + client.twitterAccountId + ", Func: " + client.streamFunc + ")");
            clients.remove(client.ws);
        }
    });
    
    // define onError
    ws.on('error', function incoming(message) {
        
        var client = clients.get(ws);
        
        // if exists -> close stream & delete
        if(client){
            if(client.stream){
                client.stream.destroy();
            }
            console.log(">> [RT]: ONERROR: CLOSED CONNECTION (TwAcc: " + client.twitterAccountId + ", Func: " + client.streamFunc + ")");
            clients.remove(client.ws);
            ws.close();
        }
    });
});
