var http = require("http");
var url = require("url");
var express = require("express");
var bodyParser = require("body-parser");
var swaggerJSDoc = require('swagger-jsdoc');
//var mongoOp = require("./models/mongo");
var router = express.Router();
var app = express();

//swagger definition
var swaggerDefinition = {
	info: {
	title: 'API de gestión de usuarios',
	version: '1.0.0',
	description: 'Descripción del API del servicio de usuarios'
	},
	host: 'zaratech-ptm.ddns.net:8888',
	basePath: '',
	};

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
