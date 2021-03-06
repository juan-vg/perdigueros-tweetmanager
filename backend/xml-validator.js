var libxml = require("libxmljs");
var fs = require('fs');
var w3c = require('w3c-validate').createValidator();

exports.validate = function(dtd, xml_str, callback){
    
    var dtd_str = fs.readFileSync('./public/XML/' + dtd + '.dtd', 'utf8');
    var success = true;

    try {
        var xml = libxml.parseXml(xml_str);

        xml = xml.setDtd(dtd_str);

        w3c.validate(xml.toString(), function (err) {
            
            if (err) {
                success = false;
            }
            
            callback(success);
        });
        
    } catch(err) {
        success = false;
        callback(success);
    }
};

