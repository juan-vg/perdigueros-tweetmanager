var http = require("http");
var url = require("url");
var express = require("express");
var bodyParser = require("body-parser");
var swaggerJSDoc = require('swagger-jsdoc');
var mongoose = require("mongoose");
var cors = require('cors');
var router = express.Router();
var app = express();

//database connection
mongoose.connect('mongodb://localhost:27017/ptm');


var local = true;

//swagger definition
var swaggerDefinition = {
    info: {
        title: 'Zaratech PTM Backend Project API',
        version: '1.0.1',
        description: 'Zaratech PTM Backend Project API'
    },
    host: 'zaratech-ptm.ddns.net:8888',
    basePath: ''
};

if(local){
    swaggerDefinition.host = 'localhost:8888';
}

// options for the swagger docs
var options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ['./app.js'],
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);

// enables JSON support & URL encoded values
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ "extended": true }));
app.use(cors());

// avoid displaying sensitive data to end users because body parser syntax errors
app.use(function (error, req, res, next) {
    if (error instanceof SyntaxError) {
        console.log("SERVER-ERROR: Syntax error");
        res.writeHead(400, {"Content-Type": "text/html"});
        res.write("Body params syntax ERROR!!");
        res.end();
    } else {
        next();
    }
});

// specify API endpoints location
var routes = require("./app.js")(app);

// swagger
app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// makes public the 'public' dir 
app.use(express.static('./public'));

// disables the 'X-Powered-By: Express' message
app.disable('x-powered-by');

var server = app.listen(8888, function () {
    console.log("Backend API server listening on port %s...", server.address().port);
});
