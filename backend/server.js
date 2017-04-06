var http = require("http");
var url = require("url");
var express = require("express");
var bodyParser = require("body-parser");
var mongoOp = require("./models/mongo");
var router = express.Router();
var app = express();

//Acepta JSON y valores codificados en la propia URL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ "extended": true }));
 
// Todos los endpoint del API se encuentran en este fichero
var routes = require("./app.js")(app);

var server = app.listen(8888, function () {
    console.log("Servidor escuchando peticiones en el puerto %s...", server.address().port);
});