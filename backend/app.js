var fs = require("fs"),
	querystring = require("querystring"),
	util = require("util"),
//	formidable = require("formidable"),
//	mongoClient = require('mongodb').MongoClient,
//	ObjectID = require('mongodb').ObjectID,
//	mongoOp = require("../models/mongo"),
	url = require("url");

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
	 *       hash:
	 *         type: string
	 *       dest:
	 *         type: string
	 */

	
	////////////////////////////////////////////////////////
	
	//registro
	app.post("/login/signup", function(request, response) {

	});

	//login
	/**
	 * @swagger
	 * login/signup:
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
		response.write("prueba ok");
	
		response.end();
	});

	//recordar passwd
	app.post("/login/remember", function(request, response) {


	});

	//todas las cuentas
	app.get("/twitter-accounts", function(request, response) {
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("prueba ok");
	
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
	app.get("/urls/:id", function(request, response) {


	});
	
	app.post("/urls", function(request, response) {


	});
	
	//SUBIR IMAGEN
	app.get("/images/:id", function(request, response) {


	});
	
	app.post("/images", function(request, response) {


	});
}

module.exports = appRouter;