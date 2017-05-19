var request = require('request');

exports.verify = function(gResponse, remoteAddress, callback){
    
    var error, data;
    
    if(gResponse === undefined || gResponse === '' || gResponse === null) {
		
		console.log("VERIFY-CAPTCHA: Select captcha");
        
        error = true;
        data = "Please select captcha";
        callback(error, data);
        
    } else {
        
        // Put your secret key here.
        var secretKey = "6LcU-iEUAAAAAJVblYTjqc9-3hol2WzdLxIJLj5_";
        
        // req.connection.remoteAddress will provide IP address of connected user.
        var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + gResponse + "&remoteip=" + remoteAddress;
        
        // Hitting GET request to the URL, Google will respond with success or error scenario.
        request(verificationUrl, function(err,response,body) {
            
            if(!err){
                body = JSON.parse(body);
                
                // Success will be true or false depending upon captcha validation.
                if(body.success !== undefined && !body.success) {
					
					console.log("VERIFY-CAPTCHA: Failed verification");
					
                    error = true;
                    data = "Failed captcha verification";
                  
                } else {
					
					console.log("VERIFY-CAPTCHA: Success");
					
                    error = false;
                    data = "Success";
                }
            } else {
				
				console.log("VERIFY-CAPTCHA: Service unavailable");
				
                error = false;
                data = "CAPTCHA ERROR";
            }
            
            callback(error, data);
        });
    }
};
