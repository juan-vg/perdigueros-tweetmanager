var fs = require("fs"),
	querystring = require("querystring"),
	util = require("util"),
	url = require("url");
var urlShortener = require('./url-shortener.js');
var twitterAccounts = require('./twitter-accounts.js');
var hashtags = require('./hashtags.js');
var followedUsers = require('./followed-users.js');

var appRouter = function(app) {
	
	/**
	 * @swagger
	 * definitions:
	 *   Twitter-accounts:
	 *     type: "object"
	 *     properties:
	 *       information:
	 *         type: "object"
	 *         description: "The tokens used to access Twitter"
	 *         properties:
	 *           consumerKey: 
	 *             type: string
	 *           consumerSecret:
	 *             type: string
	 *           accessToken: 
	 *             type: string
	 *           accessTokenSecret: 
	 *             type: string
	 *       description:
	 *         type: string
	 *         description: "The twitter account description"
	 *   Urls:
	 *     type: "object"
	 *     properties:
	 *       url:
	 *         type: string
	 *         description: "The URL string"
	 *   Hashtags:
	 *     type: "object"
	 *     properties:
	 *       hashtag:
	 *         type: string
	 *         description: "The Hashtag string"
	 *   Followed-users:
	 *     type: "object"
	 *     properties:
	 *       user:
	 *         type: string
	 *         description: "The user to be followed"
	 *          
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
	 *       - POST login singin
	 *     description: Log in the system
	 *     produces:
	 *       - application/json
	 *       - text/html
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
	 * /twitter-accounts:
	 *   get:
	 *     tags:
	 *       - GET all accounts
	 *     description: Get information of all twitter accounts
	 *     parameters:
	 *       - name: usertoken
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *     produces:
	 *       - text/html
	 *       - application/json
	 *     responses:
	 *       200:
	 *         description: Accounts have been successfully obtained 
	 *       403:
	 *         description: The user (token) does not have permission
	 *       500:
	 *         description: Error getting the accounts from database
	 */
	app.get("/twitter-accounts", function(request, response) {
		console.log("APP-GET-ALL-ACCOUNTS");
		
		twitterAccounts.getAll(request.headers.usertoken, function (err, data){
				if(!err){	
					if (data !== null) {
						console.log("APP-GET-ALL-ACCOUNTS: Accounts found OK");
						
						response.writeHead(200, {"Content-Type": "application/json"});
						response.write(JSON.stringify(data));
					} else {
						console.log("APP-GET-ALL-ACCOUNTS: No accounts found");
						
						response.writeHead(200, {"Content-Type": "text/html"});
						response.write("No accounts found.");
					}
				} else {
					if (data == "FORBIDDEN") {
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
	/**
	 * @swagger
	 * /twitter-accounts/{id}:
	 *   get:
	 *     tags:
	 *       - GET single account
	 *     description: Get information of a single account
	 *     parameters:
	 *       - name: usertoken
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The twitter account ID 
	 *     produces:
	 *       - text/html
	 *       - application/json
	 *     responses:
	 *       200:
	 *         description: Information about the twitter account 
	 *       403:
	 *         description: The user (token) does not have permission on that twitter account (id)
	 *       500:
	 *         description: Error getting the account information from database
	 */
	app.get("/twitter-accounts/:id", function(request, response) {
		console.log("APP-GET-ACCOUNTS-ID");
		
		twitterAccounts.getAccount(request.params.id, request.headers.usertoken, function (err, data){
				if(!err){
					console.log("APP-GET-ACCOUNTS-ID: Account found OK");
					
					response.writeHead(200, {"Content-Type": "application/json"});
					response.write(JSON.stringify(data));
					
				} else if (data == "FORBIDDEN"){
					console.log("APP-GET-ACCOUNTS-ID: No accounts found");
					
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if (data == "NOT FOUND"){
					console.log("APP-GET-ACCOUNTS-ID: No accounts found");
					
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
	/**
	 * @swagger
	 * /twitter-accounts:
	 *   post:
	 *     tags:
	 *       - POST new twitter account
	 *     description: Create a new twitter account
	 *     parameters:
	 *       - name: usertoken
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: twitteraccount
	 *         in: body
	 *         required: true
	 *         description: The twitter account description and the tokens used to access Twitter
	 *         schema:
	 *           $ref: "#/definitions/Twitter-accounts"
	 *     produces:
	 *       - text/html
	 *       - application/json
	 *     responses:
	 *       201:
	 *         description: Twitter account created 
	 *       409:
	 *         description: The account already exists.
	 *       500:
	 *         description: Error inserting the twitter account into the database
	 */
	app.post("/twitter-accounts", function(request, response) {
		console.log("APP-POST-ACCOUNT");
		
		var newAccount = {
				"description": request.body.description,
				"information": request.body.information
		};
		
		twitterAccounts.postAccount(request.headers.usertoken, newAccount, function (err, data){
			if(!err){
				console.log("APP-POST-ACCOUNT: OK");
				
				response.writeHead(201, {"Content-Type": "text/html"});
				response.write("Created");
			} else {
				if (data == "DB ERROR") {
					console.log("APP-POST-ACCOUNT: Error while performing query");
					
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Error while performing query");
				} else {
					console.log("APP-POST-ACCOUNT: Already exists");
					
					response.writeHead(409, {"Content-Type": "text/html"});
					response.write("Account already exists");
				}
			}
			response.end();
		}
	);
	});
	
	//borra una cuenta
	/**
	 * @swagger
	 * /twitter-accounts/{id}:
	 *   delete:
	 *     tags:
	 *       - DELETE account
	 *     description: Disable a twitter account
	 *     parameters:
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The twitter account ID 
	 *       - name: usertoken
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *     produces:
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: The account has been successfully disabled 
	 *       403:
	 *         description: The user (token) does not own this twitter account (id)
	 *       404:
	 *         description: Unable to find the requested {id}
	 *       500:
	 *         description: Error deleting twitter account
	 */
	app.delete("/twitter-accounts/:id", function(request, response) {
		console.log("APP-DEL-ACCOUNTS-ID: Requested ACCOUNT-ID is: " + request.params.id);
		
		twitterAccounts.deleteAccount(request.headers.usertoken, request.params.id,
			function (err, res){
				if(!err){
					console.log("APP-DEL-ACCOUNTS-ID: Delete OK");
					
					response.writeHead(200, {"Content-Type": "text/html"});
					response.write("Deleted account");
				} else {
					if(res == 'FORBIDDEN'){
						console.log("APP-DEL-ACCOUNTS-ID: Requested Account-ID is forbidden");
						
						response.writeHead(403, {"Content-Type": "text/html"});
						response.write("Forbidden. The user does not own this account");
					} else if(res == 'NOT FOUND') {
						console.log("APP-DEL-ACCOUNTS-ID: Requested Account-ID not found");
						
						response.writeHead(404, {"Content-Type": "text/html"});
						response.write("Account ID not found!");
					} else {
						console.log("APP-DEL-ACCOUNTS-ID: Error performing query");
						
						response.writeHead(500, {"Content-Type": "text/html"});
						response.write("Error performing query");
					}
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
	
	/**
	 * @swagger
	 * /twitter-accounts/{id}/hashtags:
	 *   get:
	 *     tags:
	 *       - GET all hashtags
	 *     description: Gets all hashtags for the provided twitter-account's {id}
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The twitter account ID that owns the hashtag list
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: The hashtag list
	 *       403:
	 *         description: Given token does not have permission to the provided twitter-account's {id}
	 *       500:
	 *         description: DB error
	 */
	app.get("/twitter-accounts/:id/hashtags", function(request, response) {
		
		var accountID = {
			'token': request.headers.token,
			'twitterAccountId': request.params.id
		};
		
		console.log("APP-GET-ALL-HASHTAGS: Retrieving all hashtags for (token: " + accountID.token + ", twitterAccountId: " + accountID.twitterAccountId + ")");
		
		hashtags.getAll(accountID,	function (err, data){
			
			if(!err){
				console.log("APP-GET-ALL-HASHTAGS: OK");
				response.writeHead(200, {"Content-Type": "application/json"});
				response.write(JSON.stringify(data));
				
			} else {
				if(data == "FORBIDDEN"){
					console.log("APP-GET-ALL-HASHTAGS: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
				} else {
					console.log("APP-GET-ALL-HASHTAGS: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Sorry, DB Error!");
				}
			}
			response.end();
		});

	});
	
	/**
	 * @swagger
	 * /twitter-accounts/{id}/hashtags/{hashtag}:
	 *   get:
	 *     tags:
	 *       - GET hashtag info
	 *     description: Gets the hashtag info for the provided (twitter-account's {id}, {hashtag})
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The twitter account ID that owns the hashtag list
	 *       - name: hashtag
	 *         in: path
	 *         required: true
	 *         description: The hashtag string to look for
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: The hashtag info
	 *       403:
	 *         description: Given token does not own the provided twitter-account's {id}
	 *       404:
	 *         description: Not found {hashtag}
	 *       500:
	 *         description: DB error
	 */
	app.get("/twitter-accounts/:id/hashtags/:hashtag", function(request, response) {
		
		var accountID = {
			'token': request.headers.token,
			'twitterAccountId': request.params.id
		};
		
		console.log("APP-GET-HASHTAGS: Retrieving a hashtag for (token: " + accountID.token + ", twitterAccountId: " + accountID.twitterAccountId + ")");
		
		hashtags.get(accountID, request.params.hashtag, function (err, data){
			
			if(!err){
				console.log("APP-GET-HASHTAGS: OK");
				response.writeHead(200, {"Content-Type": "application/json"});
				response.write(JSON.stringify(data));
				
			} else {
				if(data == "FORBIDDEN"){
					console.log("APP-GET-HASHTAGS: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
				} else if(data == "NOT FOUND"){
					console.log("APP-GET-HASHTAGS: Not found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("Not Found");				
				} else {
					console.log("APP-GET-HASHTAGS: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Sorry, DB Error!");
				}
			}
			response.end();
		});
	});

	/**
	 * @swagger
	 * /twitter-accounts/{id}/hashtags:
	 *   post:
	 *     tags:
	 *       - POST hashtag
	 *     description: Creates a new hashtag for the provided twitter-account's {id}
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The twitter account ID that owns the hashtag list
	 *       - name: hashtag
	 *         in: body
	 *         required: true
	 *         description: The hashtag string to create
	 *         schema:
	 *           $ref: "#/definitions/Hashtags"
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       201:
	 *         description: Hashtag created
	 *       403:
	 *         description: Given token does not own the provided twitter-account's {id}
	 *       409:
	 *         description: Conflict. The {hashtag} already exists for the provided twitter-account's {id}
	 *       500:
	 *         description: DB error
	 */
	app.post("/twitter-accounts/:id/hashtags", function(request, response) {
		var accountID = {
			'token': request.headers.token,
			'twitterAccountId': request.params.id
		};
		
		console.log("APP-POST-HASHTAG: Creating hashtag " + request.body.hashtag + " for (token: " + accountID.token + ", twitterAccountId: " + accountID.twitterAccountId + ")");
		
		hashtags.post(accountID, request.body.hashtag, function (err, data){
			
			if(!err){
				console.log("APP-POST-HASHTAG: OK");
				response.writeHead(201, {"Content-Type": "text/html"});
				response.write("Created");
				
			} else {
				if(data == "FORBIDDEN"){
					console.log("APP-POST-HASHTAG: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
				} else if(data == "ALREADY EXISTS"){
					console.log("APP-POST-HASHTAG: Conflict. Already exists!!!");
					response.writeHead(409, {"Content-Type": "text/html"});
					response.write("Hashtag already exists for the provided twitter account");				
				} else {
					console.log("APP-POST-HASHTAG: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Sorry, DB Error!");
				}
			}
			response.end();
		});
	});
	
	app.put("/twitter-accounts/:id/hashtags/:hashtag", function(request, response) {
		// Not implemented yet. Waiting for more data
		console.log("APP-PUT-HASHTAG: Called!");
		response.writeHead(501, {"Content-Type": "text/html"});
		response.write("Not implemented yet");
	});
	
	/**
	 * @swagger
	 * /twitter-accounts/{id}/hashtags/{hashtag}:
	 *   delete:
	 *     tags:
	 *       - DELETE hashtag
	 *     description: Deletes the specified {hashtag} for the provided twitter-account's {id}
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The twitter account ID that owns the hashtag list
	 *       - name: hashtag
	 *         in: path
	 *         required: true
	 *         description: The hashtag string to delete
	 *     produces:
	 *       - application/json
	 *     responses:
	 *       200:
	 *         description: Hashtag deleted
	 *       403:
	 *         description: Given token does not own the provided twitter-account's {id}
	 *       409:
	 *         description: Conflict. The {hashtag} does not exist for the provided twitter-account's {id}
	 *       500:
	 *         description: DB error
	 */
	app.delete("/twitter-accounts/:id/hashtags/:hashtag", function(request, response) {
		var accountID = {
			'token': request.headers.token,
			'twitterAccountId': request.params.id
		};
		
		console.log("APP-DELETE-HASHTAG: Deleting hashtag " + request.params.hashtag + " for (token: " + accountID.token + ", twitterAccountId: " + accountID.twitterAccountId + ")");
		
		hashtags.delete(accountID, request.params.hashtag, function (err, data){
			
			if(!err){
				console.log("APP-DELETE-HASHTAG: OK");
				response.writeHead(200, {"Content-Type": "text/html"});
				response.write("Deleted");
				
			} else {
				if(data == "FORBIDDEN"){
					console.log("APP-DELETE-HASHTAG: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
				} else if(data == "NOT EXIST"){
					console.log("APP-DELETE-HASHTAG: Conflict. Does not exist!!!");
					response.writeHead(409, {"Content-Type": "text/html"});
					response.write("Hashtag does not exist for the provided twitter account");				
				} else {
					console.log("APP-DELETE-HASHTAG: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Sorry, DB Error!");
				}
			}
			response.end();
		});
	});
	
	//USUARIOS FOLLOWED
	
	/**
     * @swagger
     * /twitter-accounts/{id}/followed-users:
     *   get:
     *     tags:
     *       - GET all followed users
     *     description: Gets all followed users for the provided twitter-account's {id}
     *     parameters:
     *       - name: token
     *         in: header
     *         required: true
     *         description: The user token
     *       - name: id
     *         in: path
     *         required: true
     *         description: The twitter account ID that owns the hashtag list
     *     produces:
     *       - application/json
     *       - text/html
     *     responses:
     *       200:
     *         description: The followed users list
     *       403:
     *         description: Given token does not have permission to the provided twitter-account's {id}
     *       500:
     *         description: DB error
     */
	app.get("/twitter-accounts/:id/followed-users", function(request, response) {
	    
	    var accountID = {
	            'token': request.headers.token,
	            'twitterAccountId': request.params.id
	        };
	        
	    console.log("APP-GET-ALL-FOLLOWED-USERS: Retrieving all followed users for (token: " + accountID.token + ", twitterAccountId: " + accountID.twitterAccountId + ")");

	    followedUsers.getAll(accountID,  function (err, data){

	        if(!err){
	            console.log("APP-GET-ALL-FOLLOWED-USERS: OK");

	            response.writeHead(200, {"Content-Type": "application/json"});
	            response.write(JSON.stringify(data));

	        } else {
	            if(data == "FORBIDDEN"){
	                console.log("APP-GET-ALL-FOLLOWED-USERS: Forbidden!!!");

	                response.writeHead(403, {"Content-Type": "text/html"});
	                response.write("Forbidden");

	            } else {
	                console.log("APP-GET-ALL-FOLLOWED-USERS: DB ERROR!!!");

	                response.writeHead(500, {"Content-Type": "text/html"});
	                response.write("Sorry, DB Error!");
	            }
	        }
	        response.end();
	    });
	});
	
	/**
     * @swagger
     * /twitter-accounts/{id}/followed-users/{user}:
     *   get:
     *     tags:
     *       - GET followed user info
     *     description: Gets the followed user info for the provided (twitter-account's {id}, {user})
     *     parameters:
     *       - name: token
     *         in: header
     *         required: true
     *         description: The user token
     *       - name: id
     *         in: path
     *         required: true
     *         description: The twitter account ID that owns the followed user list
     *       - name: user
     *         in: path
     *         required: true
     *         description: The followed user to look for
     *     produces:
     *       - application/json
     *       - text/html
     *     responses:
     *       200:
     *         description: The followed user info
     *       403:
     *         description: Given token does not own the provided twitter-account's {id}
     *       404:
     *         description: Not found {user}
     *       500:
     *         description: DB error
     */
	app.get("/twitter-accounts/:id/followed-users/:user", function(request, response) {
	    
	    var accountID = {
	            'token': request.headers.token,
	            'twitterAccountId': request.params.id
	        };
	        
        console.log("APP-GET-FOLLOWED-USERS: Retrieving a followed user for (token: " + accountID.token + ", twitterAccountId: " + accountID.twitterAccountId + ")");
        
        followedUsers.get(accountID, request.params.user, function (err, data){
            
            if(!err){
                console.log("APP-GET-FOLLOWED-USERS: OK");
                
                response.writeHead(200, {"Content-Type": "application/json"});
                response.write(JSON.stringify(data));
                
            } else {
                if(data == "FORBIDDEN"){
                    console.log("APP-GET-FOLLOWED-USERS: Forbidden!!!");
                    
                    response.writeHead(403, {"Content-Type": "text/html"});
                    response.write("Forbidden");
                    
                } else if(data == "NOT FOUND"){
                    console.log("APP-GET-FOLLOWED-USERS: Not found!!!");
                    
                    response.writeHead(404, {"Content-Type": "text/html"});
                    response.write("Not Found");  
                    
                } else {
                    console.log("APP-GET-FOLLOWED-USERS: DB ERROR!!!");
                    
                    response.writeHead(500, {"Content-Type": "text/html"});
                    response.write("Sorry, DB Error!");
                }
            }
            response.end();
        });
	});

	 /**
     * @swagger
     * /twitter-accounts/{id}/followed-users:
     *   post:
     *     tags:
     *       - POST followed user
     *     description: Creates a new followed user for the provided twitter-account's {id}
     *     parameters:
     *       - name: token
     *         in: header
     *         required: true
     *         description: The user token
     *       - name: id
     *         in: path
     *         required: true
     *         description: The twitter account ID that owns the hashtag list
     *       - name: user
     *         in: body
     *         required: true
     *         description: The user to be followed
     *         schema:
     *           $ref: "#/definitions/Followed-users"
     *     produces:
     *       - application/json
     *       - text/html
     *     responses:
     *       201:
     *         description: Followed user created
     *       403:
     *         description: Given token does not own the provided twitter-account's {id}
     *       409:
     *         description: Conflict. The {user} already exists for the provided twitter-account's {id}
     *       500:
     *         description: DB error
     */
	app.post("/twitter-accounts/:id/followed-users", function(request, response) {
	    var accountID = {
	            'token': request.headers.token,
	            'twitterAccountId': request.params.id
	        };
	        
	    console.log("APP-POST-FOLLOWED-USERS: Creating user " + request.body.user + " for (token: " + accountID.token + ", twitterAccountId: " + accountID.twitterAccountId + ")");
	        
        followedUsers.post(accountID, request.body.user, function (err, data){
            
            if(!err){
                console.log("APP-POST-FOLLOWED-USERS: OK");
                
                response.writeHead(201, {"Content-Type": "text/html"});
                response.write("Created");
                
            } else {
                if(data == "FORBIDDEN"){
                    console.log("APP-POST-FOLLOWED-USERS: Forbidden!!!");
                    
                    response.writeHead(403, {"Content-Type": "text/html"});
                    response.write("Forbidden");
                    
                } else if(data == "ALREADY EXISTS"){
                    console.log("APP-POST-FOLLOWED-USERS: Conflict. Already exists!!!");
                    
                    response.writeHead(409, {"Content-Type": "text/html"});
                    response.write("Followed user already exists for the provided twitter account");    
                    
                } else {
                    console.log("APP-POST-FOLLOWED-USERS: DB ERROR!!!");
                    
                    response.writeHead(500, {"Content-Type": "text/html"});
                    response.write("Sorry, DB Error!");
                }
            }
            response.end();
        });
	});
	
	/**
     * @swagger
     * /twitter-accounts/{id}/followed-users:
     *   put:
     *     tags:
     *       - PUT followed user
     *     description: Updates the followed user for the provided twitter-account's {id}
     *     parameters:
     *       - name: token
     *         in: header
     *         required: true
     *         description: The user token
     *       - name: id
     *         in: path
     *         required: true
     *         description: The twitter account ID that owns the followed users list
     *       - name: user
     *         in: body
     *         required: true
     *         description: The new user to be followed
     *         schema:
     *           $ref: "#/definitions/Followed-users"
     *     produces:
     *       - application/json
     *       - text/html
     *     responses:
     *       200:
     *         description: Followed user updated
     *       403:
     *         description: Given token does not own the provided twitter-account's {id}
     *       409:
     *         description: Conflict. The {user} already exists for the provided twitter-account's {id}
     *       500:
     *         description: DB error
     */
	app.put("/twitter-accounts/:id/followed-users/:user", function(request, response) {
	    
	    var accountID = {
                'token': request.headers.token,
                'twitterAccountId': request.params.id
            };
            
        console.log("APP-PUT-FOLLOWED-USERS: Updating user " + request.params.user + " by " + request.body.user + " for (token: " + accountID.token + ", twitterAccountId: " + accountID.twitterAccountId + ")");
        
        followedUsers.put(accountID, request.params.user, request.body.user, function (err, data){
           
            if(!err){
                console.log("APP-PUT-FOLLOWED-USERS: OK");
                
                response.writeHead(200, {"Content-Type": "text/html"});
                response.write("Updated");
                
            } else {
                if(data == "FORBIDDEN"){
                    console.log("APP-PUT-FOLLOWED-USERS: Forbidden!!!");
                    
                    response.writeHead(403, {"Content-Type": "text/html"});
                    response.write("Forbidden");
                    
                } else if(data == "DOES NOT EXISTS"){ 
                    console.log("APP-PUT-FOLLOWED-USERS: Followed user does not exists!!!");
                    
                    response.writeHead(409, {"Content-Type": "text/html"});
                    response.write("Followed user does not exists for the provided twitter account");    
                    
                } else {
                    console.log("APP-PUT-FOLLOWED-USERS: DB ERROR!!!");
                    
                    response.writeHead(500, {"Content-Type": "text/html"});
                    response.write("Sorry, DB Error!");
                }
            }
            response.end();
        });
	});
	
	   /**
     * @swagger
     * /twitter-accounts/{id}/followed-users/{user}:
     *   delete:
     *     tags:
     *       - DELETE followed user
     *     description: Deletes the specified {user} for the provided twitter-account's {id}
     *     parameters:
     *       - name: token
     *         in: header
     *         required: true
     *         description: The user token
     *       - name: id
     *         in: path
     *         required: true
     *         description: The twitter account ID that owns the followed user list
     *       - name: user
     *         in: path
     *         required: true
     *         description: The followed user to delete
     *     produces:
     *       - application/json
     *       - text/html
     *     responses:
     *       200:
     *         description: Followed user deleted
     *       403:
     *         description: Given token does not own the provided twitter-account's {id}
     *       409:
     *         description: Conflict. The {user} does not exist for the provided twitter-account's {id}
     *       500:
     *         description: DB error
     */
	app.delete("/twitter-accounts/:id/followed-users/:user", function(request, response) {
	    var accountID = {
	            'token': request.headers.token,
	            'twitterAccountId': request.params.id
	        };
	        
	    console.log("APP-DELETE-FOLLOWED-USERS: Deleting user " + request.params.user + " for (token: " + accountID.token + ", twitterAccountId: " + accountID.twitterAccountId + ")");

	    followedUsers.delete(accountID, request.params.user, function (err, data){

	        if(!err){
	            console.log("APP-DELETE-FOLLOWED-USERS: OK");

	            response.writeHead(200, {"Content-Type": "text/html"});
	            response.write("Deleted");

	        } else {
	            if(data == "FORBIDDEN"){
	                console.log("APP-DELETE-FOLLOWED-USERS: Forbidden!!!");

	                response.writeHead(403, {"Content-Type": "text/html"});
	                response.write("Forbidden");

	            } else if(data == "NOT EXIST"){
	                console.log("APP-DELETE-FOLLOWED-USERS: Conflict. Does not exist!!!");

	                response.writeHead(409, {"Content-Type": "text/html"});
	                response.write("Hashtag does not exist for the provided twitter account"); 

	            } else {
	                console.log("APP-DELETE-FOLLOWED-USERS: DB ERROR!!!");

	                response.writeHead(500, {"Content-Type": "text/html"});
	                response.write("Sorry, DB Error!");
	            }
	        }
	        response.end();
        });
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