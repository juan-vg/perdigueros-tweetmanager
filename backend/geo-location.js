var request = require('request');

exports.location = function(ip, callback){
    
    var error, data;
    
    var url = "http://ip-api.com/json/" + ip;
    
    request(url, function(err,response,body) {
        
        if(!err){
            body = JSON.parse(body);
            
            if(body.status == "success"){
                error = false;
                data = body.country;
            } else {
                error = true;
                data = "SERVICE ERROR";
            }
            
        } else {
            console.log("REQ ERROR");
            error = true;
            data = "REQ ERROR";
        }
        
        callback(error, data);
    });
};


