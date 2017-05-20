var TwitterPackage = require('twitter');
var WebSocket = require('ws');
var twiAccModel = require("./models/twitter-accounts");
var hashtagsModel = require("./models/hashtags");
var follUsModel = require("./models/followed-users");
var accVerificator = require("./account-verifications.js");
var dbVerificator = require("./db-verifications.js");
var mongoose = require("mongoose");
var objectID = require('mongodb').ObjectID;

const wss = new WebSocket.Server({ port: 8889 }, function(err){
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
                        
                        var query = {track: list.join(",")};
                        
                        if(query.track && query.track.length > 0){
                            
                            // create stream
                            Twitter.stream('statuses/filter', query, function(stream) {
                            
                                // save stream handler
                                if(!clients[index].stream){
                                    clients[index].stream = stream;
                                }

                                stream.on('data', function(event) {
                                    callback(event.text);
                                });

                                stream.on('error', function(error) {
                                    console.log("TWITTER ERROR");
                                    callback("TWITTER ERROR");
                                });

                            });
                            
                        } else {
                            console.log("EMPTY HASHTAG LIST");
                            callback("EMPTY LIST ERROR");
                        }
                        
                    } else {
                        console.log("H DB ERROR");
                        callback("DB ERROR");
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
                        
                        var query = {follow: list.join(",")};
                        
                        if(query.follow && query.follow.length > 0){
                            // create stream
                            Twitter.stream('statuses/filter', query, function(stream) {
                            
                                // save stream handler
                                if(!clients[index].stream){
                                    clients[index].stream = stream;
                                }

                                stream.on('data', function(event) {
                                    callback(event.text);
                                });

                                stream.on('error', function(error) {
                                    console.log("TWITTER ERROR");
                                    callback("TWITTER ERROR");
                                });

                            });
                            
                        } else {
                            console.log("EMPTY FOLLOWED LIST");
                            callback("EMPTY LIST ERROR");
                        }
                        
                    } else {
                        console.log("FU DB ERROR");
                        callback("DB ERROR");
                    }
                });
            }
            
        } else {
            console.log("TA DB ERROR");
            callback("DB ERROR");
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
            if(message.search("token:") == 0 && message.length > 6){
                
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
                                
                                streamFunc(index, function(text){
                                        
                                    ws.send(text);
                                        
                                    if(text.search("ERROR")){
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
