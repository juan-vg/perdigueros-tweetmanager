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
                    data =  fs.readFileSync(res[0].route);

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
    
    var hash = crypto.createHash('md5').update(JSON.stringify(image)).digest('hex');
    dbImages.hash = hash + crypto.randomBytes(10).toString('hex');

    // Store the image on the server
    fs.rename(image.path, "img/" + dbImages.hash + ".png", function(error) {
        if(error) {
            
            fs.unlink(image.path, function(error){ 
                // ignore
            });
            
            fs.unlink("img/" + dbImages.hash + ".png", function(error){ 
                // ignore
            });
            
            console.log("UPLOAD-IMAGES-POST: Error while renaming the image");

            error = true;
            data = null;
            callback(error, data);
                    
        } else {
            
            fs.unlink(image.path, function(error){ 
                // ignore
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
        }
    });
};
