var fs = require("fs"),
	querystring = require("querystring"),
	util = require("util"),
//	formidable = require("formidable"),
//	mongoClient = require('mongodb').MongoClient,
//	ObjectID = require('mongodb').ObjectID,
//	mongoOp = require("../models/mongo"),
	url = require("url");
var urlShortener = require('./url-shortener.js');
var twitterAccounts = require('./twitter-accounts.js');

var appRouter = function(app) {
	
	/**
	 * @swagger
	 * definition:
	 *   twitter-accounts:
	 *     properties:
	 *       id:
	 *         type: string
	 *       info:
	 *         type: string
	 *       description:
	 *         type: string
	 *   urls:
	 *     properties:
	 *       URL-ID:
	 *         type: string
	 *       URL:
	 *         type: string
	 */

	
	////////////////////////////////////////////////////////
	
	//registro
	app.post("/login/signup", function(request, response) {

	});

	//login
	/**
	 * @swagger
	 * login/signin:
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
	/**
	 * @swagger
	 * twitter-accounts/:
	 *   get:
	 *     tags:
	 *       - GET accounts
	 *     description: Get information of all accounts
	 *     produces:
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: Accounts have been successfully obtained 
	 *       500:
	 *         description: Error getting the accounts
	 */
	app.get("/twitter-accounts", function(request, response) {
		console.log("APP-GET-ALL-ACCOUNTS");
		
		twitterAccounts.getAll(request.headers.usertoken, function (err, data){
				if(!err){	
					if (data != null) {
						console.log("APP-GET-ALL-ACCOUNTS: Accounts founded OK");
						
						response.writeHead(200, {"Content-Type": "application/json"});
						response.write(JSON.stringify(data));
					} else {
						console.log("APP-GET-ALL-ACCOUNTS: No accounts founded");
						
						response.writeHead(200, {"Content-Type": "text/html"});
						response.write("No accounts founded.");
					}
				} else {
					if (data = "FORBIDDEN") {
						console.log("APP-GET-ALL-ACCOUNTS: Forbbiden");
						
						response.writeHead(403, {"Content-Type": "text/html"});
						response.write("Forbidden");
					} else {
						console.log("APP-GET-ALL-ACCOUNTS: Error while performing query");
						
						response.writeHead(500, {"Content-Type": "text/html"});
						response.write("Error getting the accounts");
					}
				}
				response.end();
			}
		);
	});

	//obtiene una cuenta
	app.get("/twitter-accounts/:id", function(request, response) {
		console.log("APP-GET-ACCOUNTS-ID");
		
		twitterAccounts.getAccount(request.params.id, request.headers.usertoken, function (err, data){
				if(!err){
					console.log("APP-GET-ACCOUNTS-ID: Account founded OK");
					
					response.writeHead(200, {"Content-Type": "text/html"});
					response.write(JSON.stringify(data));
					
				} else if (data == "FORBIDDEN"){
					console.log("APP-GET-ACCOUNTS-ID: No accounts founded");
					
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if (data == "NOT FOUND"){
					console.log("APP-GET-ACCOUNTS-ID: No accounts founded");
					
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("Not found");
					
				} else {
					console.log("APP-GET-ACCOUNTS-ID: Error while performing query");
					
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Error while performing query");
				}
				response.end();
			}
		);
	});
	
	//crea una cuenta
	app.post("/twitter-accounts", function(request, response) {
		console.log("APP-POST-ACCOUNT");
		
		var newAccount = {
				"description": request.body.description,
				"information": request.body.information
		}
		
		twitterAccounts.postAccount(request.headers.usertoken, newAccount, function (err, data){
			if(!err){
				if (data !== null) {
					console.log("APP-POST-ACCOUNT: OK");
					
					response.writeHead(200, {"Content-Type": "text/html"});
					response.write(JSON.stringify(data));
				} else {
					console.log("APP-POST-ACCOUNT: Error while creating account");
					
					response.writeHead(200, {"Content-Type": "text/html"});
					response.write("Error, the account has not been created.");
				}
				
			} else {
				console.log("APP-POST-ACCOUNT: Error while performing query");
				
				response.writeHead(500, {"Content-Type": "text/html"});
				response.write("Error while performing query");
			}
			response.end();
		}
	);
	});
	
	//borra una cuenta
	/**
	 * @swagger
	 * twitter-accounts/{id}:
	 *   delete:
	 *     tags:
	 *       - DELETE account
	 *     description: 
	 *     parameters:
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The ID account
	 *         type: string
	 *     produces:
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: The account has been successfully removed 
	 *       403:
	 *         description: The user does not own this account
	 *       404:
	 *         description: Unable to find the requested {id}
	 */
	app.delete("/twitter-accounts/:id", function(request, response) {
		console.log("APP-DEL-ACCOUNTS-ID: Requested ACCOUNT-ID is: " + request.params.id);
		
		//TODO Comprobar que el id que pasa el usuario es correcto
		twitterAccounts.deleteAccount(request.params.id, request.headers.token,
			function (err){
				if(!err){
					console.log("APP-DEL-ACCOUNTS-ID: Delete ok");
					response.writeHead(200, {"Content-Type": "text/html"});
					response.write("Deleted account");
					
				} else if(err == 'forbidden'){
					console.log("APP-DEL-ACCOUNTS-ID: Requested Account-ID is forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("The user does not own this account!");
				} else {
					console.log("APP-DEL-ACCOUNTS-ID: Requested Account-ID not found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("Account ID not found!");
				}
				response.end();
			}
		);
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
	app.get("/hashtags", function(request, response) {


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
	 * urls/{id}:
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
	 * urls:
	 *   post:
	 *     tags:
	 *       - POST short url
	 *     description: Creates a new short URL associated with the provided {url}
	 *     parameters:
	 *       - name: url
	 *         in: body
	 *         required: true
	 *         description: The URL string
	 *         type: string
	 *     produces:
	 *       - text/html
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
					response.write("Short URL saved!");
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
