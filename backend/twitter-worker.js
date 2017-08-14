var twAccModel = require("./models/twitter-accounts");
var usersModel = require("./models/user-accounts");
var twStatsModel = require("./models/twitter-stats");
var twWorkerModel = require("./models/twitter-worker");
var TwitterPackage = require('twitter');
var objectID = require('mongodb').ObjectID;



var mongoose = require("mongoose");
//database connection
mongoose.connect('mongodb://localhost:27017/ptm');

exports.loadAccounts = function(){
    
    // get all tracked twitter account ids
    twWorkerModel.find({}, {accId:1, _id:0}, function(err, dbData){
        if(!err){
            
            var ids = dbData.map(function(data) { return new objectID(data.accId); });
            
            // get NOT tracked twitter accounts
            twAccModel.find({_id:{$not:{$in:ids}}}, {_id:1, email:1}, function(err, dbData){

                if(!err){
                    
                    for(var i=0; i<dbData.length; i++){
                        
                        usersModel.find({email: dbData[i].email}, {_id:1}, function(err, dbData){
                            
                            if(!err && dbData.length > 0){
                                
                                var dbWorker = new twWorkerModel();
                                dbWorker.userId = dbData[0]._id;
                                dbWorker.accId = this._id;
                                dbWorker.action = "ready";
                                dbWorker.newestTweetId = -1;
                                dbWorker.oldestTweetId = -1;
                                
                                dbWorker.save(function(err, dbData){
                                    if(err){
                                        console.log("TWITTER-WORKER-LOAD-ACC: DB ERROR (twWorker-save)");
                                    }
                                });
                                
                            } else {
                                console.log("TWITTER-WORKER-LOAD-ACC: DB ERROR (users)");
                            }
                            
                        }.bind(dbData[i]));
                    }
                    
                } else {
                    console.log("TWITTER-WORKER-LOAD-ACC: DB ERROR (twAcc)");
                }
            });
        } else {
            console.log("TWITTER-WORKER-LOAD-ACC: DB ERROR (twWorker-find)");
        }
    });
}

loadAccounts();
