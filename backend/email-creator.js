var Mail = require('./email-sender.js');

exports.sendMail = function(emailData, callback){
    
    var error, data;
    
    // header
    var message = 'Hello '+ emailData.name +',\n\n';
    
    // body
    if(emailData.type == "validate"){
        message += 'We are glad to inform you that your new account';
        message += ' has been created.\nPlease, use the following code in order to validate your email.\n\nCode: ' + emailData.code;
            
    } else if(emailData.type == "passwd"){
        message += 'We have created a new password for you.\n';
        message += '\n\nPassword: ' + emailData.passwd;
    } else {
        //TODO
        message += 'Hello '+ emailData.name +', we are glad to inform you that your new account '+ emailData.account;
        message += ' has been created. Please, use the following code in order to validate your email. Code: ' + emailData.code;
    }
    
    // footer
    message += '\n\n\nBest regards,\nThe PTM team.\nA Zaratech Dynamics product.\nAll rights registered 2017.';
    

    var mail = new Mail({
        to: emailData.to,
        subject: 'PTM - Perdigueros Tweet Manager',
        message: message,
        successCallback: function(suc) {
            error = false;
            data = null;
            callback(error, data);
        },
        errorCallback: function(err) {
            error = true;
            data = err;
            callback(error, data);
        }
    });

    mail.send();
};
