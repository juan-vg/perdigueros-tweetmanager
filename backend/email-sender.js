'use strict';
const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: 'zaratech.ptm@gmail.com',
        pass: 'zaratech.ptm-zaratech.ptm'
    }
});

module.exports = function(params) {
    this.from = 'zaratech.ptm@gmail.com';

    this.send = function(){
        var options = {
            from : this.from,
            to : params.to,
            subject : params.subject,
            text : params.message
        };

        transporter.sendMail(options, function(err, suc){
            
            if(!err){
                params.successCallback(suc);
            } else {
                params.errorCallback(err);
            }
        });
    };
};
