var usersModel = require("./models/user-accounts");
var accVerificator = require('./account-verifications.js');

//TODO estadisticas del admim (altas, bajas, ultimos accesos, recursos introducidos...)
//{
//datos1est: {datos},
//datos2est: {datos},
//...
//}

exports.get= function(accountID, callback){
    var error, data;

    // check if the token has access admin permissions
//    accVerificator.verifyAdmin(accountID, function(success, reason){
//
//        if(success){
            data = { 
                    "registrationDate" : [],
                    "downs" : [],
                    "lastAccess" : [],
                    "resources" : []
            };
            
            // REGISTRATION DATE
            usersModel.find({activated:true, admin:false}, {_id:0, email:1, registrationDate:1}, function(err, res){
                if(!err) {
                    console.log("ADMIN-STATS-GET: Registration dates obtained: ", res);
                    error = false;
                    data.registrationDate = res;
                } else {
                    console.log("ADMIN-STATS-GET: Error getting registration dates.");
                    error = true;
                    data.registrationDate = [];
                }   
            });
            
            // DOWNS
            usersModel.find({activated:false, admin:false}, {_id:0, email:1}, function(err, res){
                if(!err) {
                    console.log("ADMIN-STATS-GET: Registry downs obtained: ", res);
                    error = false;
                    data.downs = res;
                } else {
                    console.log("ADMIN-STATS-GET: Error getting registration downs.");
                    error = true;
                    data.downs = [];
                }   
            });

            // LAST ACCESS
            usersModel.find({activated:true, admin:false}, {_id:0, email:1, lastAccess:1}, function(err, res){
                  if(!err) {
                      console.log("ADMIN-STATS-GET: Last access obtained: ", res);
                      error = false;
                      data.lastAccess = res;
                  } else {
                      console.log("ADMIN-STATS-GET: Error getting last access.");
                      error = true;
                      data.lastAccess = [];
                  }   
            });

            // RESOURCES
            // TODO ??
            
            callback(error, data);
//        } else {
//            error = true;
//            data = "FORBIDDEN";
//
//            callback(error, data);
//        }
//    });
};

