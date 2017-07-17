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
        title: 'API de gestión de usuarios',
        version: '1.0.0',
        description: 'Descripción del API del servicio de usuarios'
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

//Acepta JSON y valores codificados en la propia URL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ "extended": true }));
app.use(cors());

//Previene mostrar info sensible por errores del body parser
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

// Todos los endpoint del API se encuentran en este fichero
var routes = require("./app.js")(app);

// swagger
app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// hace publica la carpeta "public"
app.use(express.static('./public'));

var server = app.listen(8888, function () {
    console.log("Servidor escuchando peticiones en el puerto %s...", server.address().port);
});
