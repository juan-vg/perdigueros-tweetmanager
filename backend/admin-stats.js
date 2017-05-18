var userAccModel = require("./models/user-accounts");
var loginStatsModel = require("./models/login-stats");
var regsDownsModel = require("./models/regs-downs-stats");
var accVerificator = require('./account-verifications.js');

//TODO estadisticas del admim (altas, bajas, ultimos accesos, recursos introducidos...)
//{
//datos1est: {datos},
//datos2est: {datos},
//...
//}

exports.saveLastAccess = function(lastAccess){
    
    storeLastAccessStats(lastAccess, function(err, data){
        if(!err){
            //ignore
        } else {
            //ignore
        }
    });
};

function storeLastAccessStats(lastAccess, callback){
    
    var dbLoginStats = new loginStatsModel();
    dbLoginStats.date = new Date(loginStatsModel);
    
    dbLoginStats.save(function(err, res){
        if(!err) {

            console.log("ADMIN-STATS-STORE-LAST-ACCESS: Stored new login.");

            error = false;
            data = null;
        } else {
            console.log("ADMIN-STATS-STORE-LAST-ACCESS: Error while performing query.");

            error = true;
            data = "DB ERROR";
        }
    });
};

exports.get= function(accountID, callback){
    var error, data;

    // check if the token has access admin permissions
//    accVerificator.verifyAdmin(accountID, function(success, reason){
//
//        if(success){
            data = { 
                    "registrationDate" : [],
                    "downs" : [],
                    "lastAccess" : {},
                    "resources" : []
            };
            error = false;
            
            // REGISTRATION DATE
            //TODO contar altas y bajas por mes, ultimos 12 meses
            regsDownsModel.find({regDown : true},{ regDown:0}, function(errReg, regs){
                if(!errReg) {
                    console.log("ADMIN-STATS-GET: Stats of the registration dates obtained.");
                    error = false;
                    data.registrationDate = regs;
                  
                    // DOWNS
                  regsDownsModel.find({regDown : false},{ regDown:0}, function(errDown, downs){
                  if(!errDown) {
                      console.log("ADMIN-STATS-GET: Stats of the registry downs obtained.");
                      error = false;
                      data.downs = downs;
                      
                      // LAST ACCESS
                      loginStatsModel.aggregate([
                         { $group:
                             { '_id': {'year':{ $year: "$date" },'month':{ $month: "$date" },  }, 
                                 count:{ $sum: 1}   
                             }
                         },
                         { $sort: 
                             { _id:-1 }
                         }
                         ],  function(err, res) {
                          if (!err){
                              console.log("ADMIN-STATS-GET: Stats of the last accesses obtained.");

                              // group by year
                              for(var i = 0; i < res.length; i++){
                                  var year = res[i]._id.year;
                                  if(!data.lastAccess[year]){
                                      data.lastAccess[year] = [];
                                  }
                                  data.lastAccess[year].push({ month: res[i]._id.month, data: res[i].count});
                              }
                              console.log(data.lastAccess); //TODO QUITAR
                              
                              error = false;
                              callback(error, data);

                          } else {
                              console.log("ADMIN-STATS-GET: Error getting last access.");
                              error = true;
                              callback(error,data);
                          }
                      });

                  } else {
                      console.log("ADMIN-STATS-GET: Error getting registration downs.");
                      error = true;
                      data.downs = [];
                      callback(error, data);
                  } 
              });                   
                    
                } else {
                    console.log("ADMIN-STATS-GET: Error getting registration dates.");
                    error = true;
                    data.registrationDate = [];
                    callback(error, data);
                }  
            });
            
            // RESOURCES
            // TODO ??

//        } else {
//            error = true;
//            data = "FORBIDDEN";
//
//            callback(error, data);
//        }
//    });
};

