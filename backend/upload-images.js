var imagesModel = require("./models/images");
var crypto = require('crypto');
var fs = require('fs');

exports.get = function (imageId, callback){
    var error, data;

    console.log("UPLOAD-IMAGES-GET: Received hash: ", imageId);
    
    imagesModel.find({ hash : imageId}, function(err, res){
        if (!err) {
            if(res.length > 0){
                console.log("UPLOAD-IMAGES-GET: Image found.");
                
                data = res[0];
                error = false;
                
                // convertir imagen bin -> ?¿
                
            } else {
                console.log("UPLOAD-IMAGES-GET: There is no data.");
                error = true;
                data = "NO DATA";
            }
        } else {
            console.log("UPLOAD-IMAGES-GET: Error while performing query.");

            error = true;
            data = "DB ERROR";
        }
        callback(error, data);
    });

};

exports.post = function (image , callback){
    var error, data;

    console.log("UPLOAD-IMAGES-POST: Trying to store image: ", image.name);

    // TODO hash

    // Store image 
    var dbImages = new imagesModel();
    dbImages.hash = crypto.createHash('sha256').update(image.lastModifiedDate.toString()).digest('base64');
    dbImages.data = fs.readFileSync(image.path);
    dbImages.contentType = image.type;

    dbImages.save(function(err, res){
        if (!err){
            console.log("UPLOAD-IMAGES-POST: Image saved successfully.");

            error = false;
            data = res.hash; //???? Es necesario devolver algo??
            callback(error, data);

        } else {
            console.log("UPLOAD-IMAGES-POST: Error while saving the image");

            error = true;
            data = null;
            callback(error, data);
        }
    });
};