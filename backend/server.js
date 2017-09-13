var http = require("http");
var url = require("url");
var express = require("express");
var bodyParser = require("body-parser");
var swaggerJSDoc = require('swagger-jsdoc');
var mongoose = require("mongoose");

// Fix for: "DeprecationWarning: Mongoose: mpromise (mongoose's default promise library) is deprecated ..."
mongoose.Promise = global.Promise;

var cors = require('cors');
var xmlparser = require('express-xml-bodyparser');
var config = require('./config');
var init = require('./init');
var router = express.Router();
var app = express();

//database connection
mongoose.connect('mongodb://localhost:27017/ptm');


var local = false;

//swagger definition
var swaggerDefinition = {
    info: {
        title: 'Zaratech PTM Backend Project API',
        version: '1.0.1',
        description: 'Zaratech PTM Backend Project API'
    },
    host: config.domain + ':' + config.apiPort,
    basePath: ''
};

if(local){
    swaggerDefinition.host = 'localhost:' + config.apiPort;
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

// enables cross origins header
app.use(cors());

// enables XML support
app.use(xmlparser({explicitArray: false}));

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

// launch server
var server = app.listen(config.apiPort, function () {
    console.log("Backend API server listening on port %s...", server.address().port);
});

// check if app init is needed
init.checkInit();
