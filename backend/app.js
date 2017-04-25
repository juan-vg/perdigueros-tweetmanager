var fs = require("fs"),
	querystring = require("querystring"),
	util = require("util"),
//	formidable = require("formidable"),
//	mongoClient = require('mongodb').MongoClient,
//	ObjectID = require('mongodb').ObjectID,
//	mongoOp = require("../models/mongo"),
	url = require("url");
	
var urlShortener = require('./url-shortener.js');
var hashtags = require('./hashtags.js');

var appRouter = function(app) {
	
	/**
	 * @swagger
	 * definitions:
	 *   Twitter-accounts:
	 *     properties:
	 *       info:
	 *         type: string
	 *       description:
	 *         type: string
	 *   Urls:
	 *     type: "object"
	 *     properties:
	 *       url:
	 *         type: string
	 *         description: "The URL string"
	 */

	
	////////////////////////////////////////////////////////
	
	//registro
	app.post("/login/signup", function(request, response) {

	});

	//login
	/**
	 * @swagger
	 * /login/signin:
	 *   post:
	 *     tags:
	 *       - Login
	 *     description: Log in the system
	 *     produces:
	 *       - application/json
	 *     responses:
	 *       200:
	 *         description: Login OK 
	 *       401:
	 *         description: Unable to log in
	 */
	app.post("/login/signin", function(request, response) {

		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("prueba ok signin");
	
		response.end();
	});

	//recordar passwd
	app.post("/login/remember", function(request, response) {


	});

	//todas las cuentas
	app.get("/twitter-accounts", function(request, response) {
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("prueba ok twitter-accounts");
	
		response.end();
	});

	//obtiene una cuenta
	app.get("/twitter-accounts/:id", function(request, response) {


	});
	
	//crea una cuenta
	app.post("/twitter-accounts/:id", function(request, response) {


	});
	
	//borra una cuenta
	app.delete("/twitter-accounts/:id", function(request, response) {


	});
	
	//publicar tweet
	app.post("/tweets/publish", function(request, response) {


	});
	
	//programar tweet
	app.post("/tweets/schedule", function(request, response) {


	});
	
	//tweets retuiteados
	app.get("/tweets/retweeted", function(request, response) {


	});
	
	//tweets marcados favoritos
	app.get("/tweets/favourited", function(request, response) {


	});
	
	//HASHTAGS
	
	/**
	 * @swagger
	 * /hashtags:
	 *   get:
	 *     tags:
	 *       - GET all hashtags
	 *     description: Gets all hashtags for the provided {twitter-account-id}
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: twitter-account-id
	 *         in: header
	 *         required: true
	 *         description: The twitter account ID that owns the hashtag list
	 *     produces:
	 *       - application/json
	 *     responses:
	 *       200:
	 *         description: The hashtag list
	 *       403:
	 *         description: Given token does not have permission to the provided {twitter-account-id}
	 *       500:
	 *         description: DB error
	 */
	app.get("/hashtags", function(request, response) {
		
		var accountID = {
			"token": request.headers.token,
			"twitter-account-id": request.headers.twitter-account-id
		}
		
		console.log("APP-GET-HASHTAGS: Retrieving all hashtags for (token: " + accountID.token + ", twitter-account-id: " + accountID.twitter-account-id + ")");
		
		hashtags.get(accountID,	function (err, data){
			
			if(!err){
				console.log("APP-GET-HASHTAGS: Requested URL is: " + url);
				response.writeHead(200, {"Content-Type": "application/json"});
				response.write("Redirecting to " + url);
				
			} else {
				if(data === "FORBIDDEN"){
					console.log("APP-GET-HASHTAGS: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "application/json"});
					response.write("Forbidden");
				} else {
					console.log("APP-GET-HASHTAGS: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "application/json"});
					response.write("Sorry, DB Error!");
				}
			}
			response.end();
		});

	});
	
	app.get("/hashtags/:id", function(request, response) {


	});

	app.post("/hashtags", function(request, response) {


	});
	
	app.put("/hashtags/:id", function(request, response) {


	});
	
	app.delete("/hashtags/:id", function(request, response) {


	});
	
	//USUARIOS FOLLOWED
	app.get("/followed-users", function(request, response) {


	});
	
	app.get("/followed-users/:id", function(request, response) {


	});

	app.post("/followed-users", function(request, response) {


	});
	
	app.put("/followed-users/:id", function(request, response) {


	});
	
	app.delete("/followed-users/:id", function(request, response) {


	});
	
	//ADMIN
	app.get("/users", function(request, response) {


	});
	
	app.get("/users/:id", function(request, response) {


	});
	
	app.put("/users/:id", function(request, response) {


	});
	
	app.delete("/users/:id", function(request, response) {


	});
	
	//cambiar passwd
	app.post("/users/:id/changepass", function(request, response) {


	});
	
	//STATS
	app.get("/stats/hashtags", function(request, response) {


	});
	
	app.get("/stats/followed-users", function(request, response) {


	});
	
	app.get("/stats/users", function(request, response) {


	});
	
	app.get("/stats/app", function(request, response) {


	});
	
	//ACORTAR URL
	/**
	 * @swagger
	 * /urls/{id}:
	 *   get:
	 *     tags:
	 *       - GET short url
	 *     description: Request the real URL associated with the provided {id}
	 *     parameters:
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The short URL-ID
	 *         type: string
	 *     produces:
	 *       - text/html
	 *     responses:
	 *       307:
	 *         description: Redirect to the real URL (provided as Location header)
	 *       404:
	 *         description: Unable to find the requested {id}
	 */
	app.get("/urls/:id", function(request, response) {
		console.log("APP-GET-URLS-ID: Requested URL-ID is: " + request.params.id);
		urlShortener.get(request.params.id,
			function (err, url){
				if(!err){
					console.log("APP-GET-URLS-ID: Requested URL is: " + url);
					response.writeHead(307, {"Content-Type": "text/html", Location: url});
					response.write("Redirecting to " + url);
				} else {
					console.log("APP-GET-URLS-ID: Requested URL-ID not found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("URL not found!");
				}
				response.end();
			}
		);
	});
	
	/**
	 * @swagger
	 * /urls:
	 *   post:
	 *     tags:
	 *       - POST short url
	 *     description: Creates a new short URL associated with the provided {url}
	 *     consumes:
	 *       - application/json
	 *     parameters:
	 *       - name: url
	 *         in: body
	 *         required: true
	 *         description: The URL string
	 *         schema:
	 *           $ref: "#/definitions/Urls"
	 *     produces:
	 *       - application/json
	 *     responses:
	 *       201:
	 *         description: The short URL was created successfully
	 *       500:
	 *         description: DB insert error
	 */
	app.post("/urls", function(request, response) {
		
		console.log("APP-POST-URLS: Posted URL is: " + request.body.url);
		urlShortener.post(request.body.url,
			function (err, urlId){
				if(!err){
					console.log("APP-POST-URLS: Short URL saved!");
					response.writeHead(201, {"Content-Type": "text/html"});
					response.write("Short URL saved! (ID="+urlId+")");
				} else {
					console.log("APP-POST-URLS: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Sorry, DB Error!");
				}
				response.end();
			}
		);
	});
	
	//SUBIR IMAGEN
	app.get("/images/:id", function(request, response) {


	});
	
	app.post("/images", function(request, response) {


	});
};

module.exports = appRouter;
