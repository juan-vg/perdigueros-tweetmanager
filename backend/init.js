var userAccModel = require("./models/user-accounts");
var crypto = require('crypto');
var config = require('./config');

function createAdmin(){
    
    var dbUsers = new userAccModel();
        dbUsers.loginType = "local";
        dbUsers.admin = true;
        dbUsers.name = "Admin";
        dbUsers.surname = "Admin";
        dbUsers.email = "admin@admin.com";
        dbUsers.registrationDate = new Date();
        dbUsers.lastAccess = null;
        dbUsers.validated = true;
        dbUsers.firstLogin = false;
        dbUsers.activated = true;
        dbUsers.password = crypto.createHash('sha256').update(config.adminPass).digest('base64');
        
        dbUsers.save(function(err,dbData){
            if(!err){
                console.log(">>> APP INIT: admin created <<<");
            } else {
                console.log(">>> APP INIT ERROR: can not create admin <<<");
            }
        });
}

exports.checkInit = function() {
    userAccModel.find({admin:true}, {email:1}, function(err, dbData) {
        if(!err){
            
            if(dbData.length == 0){
                createAdmin();
            }
            
        } else {
            console.log(">>> APP INIT ERROR: can not check if admin is present <<<");
        }
    });
}
