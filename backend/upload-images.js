var imagesModel = require("./models/images");
var crypto = require('crypto');
var fs = require('fs');

//Get an image (imageId) from the server
exports.get = function (imageId, callback){
    var error, data;

    console.log("UPLOAD-IMAGES-GET: Received hash: ", imageId);

    imagesModel.find({ hash : imageId}, function(err, res){
        if (!err) {
            if(res.length > 0){
                console.log("UPLOAD-IMAGES-GET: Image found.");

                // Search the image on the server
                try {
                    error = false;
                    data =  fs.readFileSync("img/" + imageId + ".png");

                } catch(fileErr) {
                    console.log("UPLOAD-IMAGES-GET: This image is not on the server.");

                    error = true;
                    data = "NOT FOUND";
                } 
            } else {
                console.log("UPLOAD-IMAGES-GET: There is no data.");

                error = true;
                data = "NOT FOUND";
            }
        } else {
            console.log("UPLOAD-IMAGES-GET: Error while performing query.");

            error = true;
            data = "DB ERROR";
        }
        callback(error, data);
    });
};

//Store an image on the server
exports.post = function (image , callback){
    var error, data;

    console.log("UPLOAD-IMAGES-POST: Trying to store image.");

    var dbImages = new imagesModel();
    dbImages.hash = crypto.randomBytes(20).toString('hex');

    // Store the image on the server
    fs.rename(image.path, "img/" + dbImages.hash + ".png", function(error) {
        if (error) {
            fs.unlink("img/" + dbImages.hash + ".png");
            dbImages.hash = crypto.randomBytes(20).toString('hex');
            fs.rename(image.path, "img/" + dbImages.hash + ".png");
        }
    });
    dbImages.route = "img/" + dbImages.hash + ".png";

    // Store hash and route on db
    dbImages.save(function(err, res){
        if (!err){
            console.log("UPLOAD-IMAGES-POST: Image stored successfully (" + dbImages.route + ").");

            error = false;
            data = res.hash; 
            callback(error, data);

        } else {
            console.log("UPLOAD-IMAGES-POST: Error while storing the image");

            error = true;
            data = null;
            callback(error, data);
        }
    });
};