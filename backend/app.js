var fs = require("fs"),
	querystring = require("querystring"),
	util = require("util"),
	url = require("url");
var urlShortener = require('./url-shortener.js');
var twitterAccounts = require('./twitter-accounts.js');
var hashtags = require('./hashtags.js');
var followedUsers = require('./followed-users.js');
var userAccounts = require('./user-accounts.js');
var uploadImages = require('./upload-images.js');
var formidable = require('formidable');
var login = require('./login.js');
var adminStats = require('./admin-stats.js');
var tweets = require('./tweets.js');
var verifyCaptcha = require('./verify-captcha.js');

var appRouter = function(app) {
	
	/**
	 * @swagger
	 * tags:
	 * - name: "Login"
	 * - name: "Users"
	 * - name: "Twitter Accounts"
	 * - name: "Hashtags"
	 * - name: "Followed"
	 * - name: "URL shortener"
     * - name: "Images"
     * - name: "Tweets"
     * - name: "Captcha"
	 * 
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
	 * 
	 *   Urls:
	 *     type: "object"
	 *     properties:
	 *       url:
	 *         type: string
	 *         description: "The URL string"
	 * 
	 *   Hashtags:
	 *     type: "object"
	 *     properties:
	 *       hashtag:
	 *         type: string
	 *         description: "The Hashtag string"
	 * 
	 *   Followed-users:
	 *     type: "object"
	 *     properties:
	 *       newuser:
	 *         type: string
	 *         description: "The user to be followed"
	 *          
	 *   Passwords:
	 *     type: "object"
	 *     properties:
	 *       oldPasswd:
	 *         type: string
	 *         description: "The OLD password"
	 *       newPasswd:
	 *         type: string
	 *         description: "The NEW password"
	 * 
	 *   Signin:
	 *     type: "object"
	 *     properties:
	 *       email:
	 *         type: string
	 *         description: "The user email"
	 *       passwd:
	 *         type: string
	 *         description: "The user password"
	 *       "g-recaptcha-response":
	 *         type: string
	 *         description: "The google captcha response"
	 * 
	 *   Signup:
	 *     type: "object"
	 *     properties:
	 *       name:
	 *         type: string
	 *         description: "The user real name"
	 *       surname:
	 *         type: string
	 *         description: "The user real surname"
	 *       email:
	 *         type: string
	 *         description: "The user email"
	 *       "g-recaptcha-response":
	 *         type: string
	 *         description: "The google captcha response"
	 * 
	 *   Validate:
	 *     type: "object"
	 *     properties:
	 *       email:
	 *         type: string
	 *         description: "The user email"
	 *       code:
	 *         type: string
	 *         description: "The emailed code"
	 * 
	 *   UserEmail:
	 *     type: "object"
	 *     properties:
	 *       email:
	 *         type: string
	 *         description: "The user email"
	 * 
	 *   FirstLogin:
	 *     type: "object"
	 *     properties:
	 *       email:
	 *         type: string
	 *         description: "The user email"
	 *       oldPasswd:
	 *         type: string
	 *         description: "The OLD password"
	 *       newPasswd:
	 *         type: string
	 *         description: "The NEW password"
	 * 
	 *   Tweet:
	 *     type: "object"
	 *     properties:
	 *       text:
	 *         type: string
	 *         description: "The tweet text"
	 * 
	 *   ScheduledTweet:
	 *     type: "object"
	 *     properties:
	 *       text:
	 *         type: string
	 *         description: "The tweet text"
	 *       date:
	 *         type: string
	 *         description: "The publish date"
	 * 
	 *   GoogleCaptchaResponse:
	 *     type: "object"
	 *     properties:
	 *       "g-recaptcha-response":
	 *         type: string
	 *         description: "The google captcha response"
	 * 
	 */


	
	////////////////////////////////////////////////////////
	
	//register
	/**
	 * @swagger
	 * /login/signup:
	 *   post:
	 *     tags:
	 *       - Login
	 *     description: Register a new user
	 *     parameters:
	 *       - name: userdata
	 *         in: body
	 *         required: true
	 *         description: The user account data needed in order to register the account
	 *         schema:
	 *           $ref: "#/definitions/Signup"
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       201:
	 *         description: User created
	 *       400:
	 *         description: Captcha validation error
	 *       409:
	 *         description: Email address already in use
	 *       500:
	 *         description: DB error
	 */
	app.post("/login/signup", function(request, response) {
		
		console.log("APP-LOGIN-SIGNUP: Trying to create user " + request.body.email);
		
		var accountData = {
			"name": request.body.name,
			"surname": request.body.surname,
			"email": request.body.email
		};
		
		var captchaData = {
			gResponse: request.body['g-recaptcha-response'],
			rAddress: request.connection.remoteAddress
		};
		
		login.signup(accountData, captchaData, function (err, data){
				if(!err){	
					console.log("APP-LOGIN-SIGNUP: OK");
						
					response.writeHead(201, {"Content-Type": "text/html"});
					response.write("Created");
					
				} else {
					if(data == "CAPTCHA ERROR"){
						console.log("APP-LOGIN-SIGNUP: Captcha validation error");
						
						response.writeHead(400, {"Content-Type": "text/html"});
						response.write("Captcha validation error");
						
					} else if(data == "ALREADY EXISTS"){
						console.log("APP-LOGIN-SIGNUP: Already exists");
						
						response.writeHead(409, {"Content-Type": "text/html"});
						response.write("Email address already in use");
						
					} else {
						console.log("APP-LOGIN-SIGNUP: Error while performing query");
					
						response.writeHead(500, {"Content-Type": "text/html"});
						response.write("Sorry, DB error!");
					}
				}
				response.end();
			}
		);
	});

	//login
	/**
	 * @swagger
	 * /login/signin:
	 *   post:
	 *     tags:
	 *       - Login
	 *     description: Log in the system
	 *     parameters:
	 *       - name: logindata
	 *         in: body
	 *         required: true
	 *         description: The user account data needed in order to log in
	 *         schema:
	 *           $ref: "#/definitions/Signin"
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: Login OK 
	 *       400:
	 *         description: Captcha validation error
	 *       401:
	 *         description: Incorrect login
	 *       409:
	 *         description: Must validate the account (email)
	 *       459:
	 *         description: Must change password first (returns the email)
	 *       500:
	 *         description: DB error
	 */
	app.post("/login/signin", function(request, response) {
		
		console.log("APP-LOGIN-SIGNIN: Trying to authenticate user " + request.body.email);
		
		var accountID = {
			"email": request.body.email,
			"passwd": request.body.passwd
		};
		
		var captchaData = {
			gResponse: request.body['g-recaptcha-response'],
			rAddress: request.connection.remoteAddress
		};
		
		login.localSignin(accountID, captchaData, function (err, data){
				if(!err){	
					console.log("APP-LOGIN-SIGNIN: OK");
						
					response.writeHead(200, {"Content-Type": "text/html"});
					response.write(JSON.stringify(data));
					
				} else {
					if(data == "CAPTCHA ERROR"){
						console.log("APP-LOGIN-SIGNIN: Captcha validation error");
						
						response.writeHead(400, {"Content-Type": "text/html"});
						response.write("Captcha validation error");
						
					} else if (data == "MUST CHANGE PASSWD") {
						console.log("APP-LOGIN-SIGNIN: Must change password");
						
						response.writeHead(459, {"Content-Type": "text/html"});
						response.write(request.body.email);
						
					} else if (data == "MUST VALIDATE") {
						console.log("APP-LOGIN-SIGNIN: Must validate account");
						
						response.writeHead(409, {"Content-Type": "text/html"});
						response.write("Must validate the account");
						
					} else if (data == "INCORRECT") {
						console.log("APP-LOGIN-SIGNIN: Incorrect passwd");
						
						response.writeHead(401, {"Content-Type": "text/html"});
						response.write("Incorrect login");
						
					} else {
						console.log("APP-LOGIN-SIGNIN: Error while performing query");
						
						response.writeHead(500, {"Content-Type": "text/html"});
						response.write("Sorry, DB error!");
					}
				}
				response.end();
			}
		);
	});
	
	//validate email
	/**
	 * @swagger
	 * /login/validate:
	 *   post:
	 *     tags:
	 *       - Login
	 *     description: Validates the emailed code
	 *     parameters:
	 *       - name: validationdata
	 *         in: body
	 *         required: true
	 *         description: The data needed in order to validate the account
	 *         schema:
	 *           $ref: "#/definitions/Validate"
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: Account validated
	 *       401:
	 *         description: Incorrect validation code
	 *       500:
	 *         description: DB error
	 */
	app.post("/login/validate", function(request, response) {
		
		console.log("APP-LOGIN-VALIDATE: Trying to validate user " + request.body.email);
		
		var accountID = {
			"email": request.body.email,
			"validationHash": request.body.code
		};
		
		login.validateUser(accountID, function (err, data){
				if(!err){	
					console.log("APP-LOGIN-VALIDATE: OK");
						
					response.writeHead(200, {"Content-Type": "text/html"});
					response.write("Validate OK");
					
				} else {
					if (data == "INCORRECT") {
						console.log("APP-LOGIN-VALIDATE: Incorrect validation code");
						
						response.writeHead(401, {"Content-Type": "text/html"});
						response.write("Incorrect validation code");
						
					} else {
						console.log("APP-LOGIN-VALIDATE: Error while performing query");
						
						response.writeHead(500, {"Content-Type": "text/html"});
						response.write("Sorry, DB error!");
					}
				}
				response.end();
			}
		);
	});
	
	//resend validation email
	/**
	 * @swagger
	 * /login/validate/resend:
	 *   post:
	 *     tags:
	 *       - Login
	 *     description: Resends the validation email
	 *     parameters:
	 *       - name: useremail
	 *         in: body
	 *         required: true
	 *         description: The user email
	 *         schema:
	 *           $ref: "#/definitions/UserEmail"
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: Email sent
	 *       409:
	 *         description: User already validated, not active, or not existing email
	 *       500:
	 *         description: DB error
	 */
	app.post("/login/validate/resend", function(request, response) {
		
		console.log("APP-LOGIN-VALIDATE-RESEND: Resending validation email to user " + request.body.email);
		
		var accountID = {
			"email": request.body.email
		};
		
		login.resendEmail(accountID, function (err, data){
				if(!err){	
					console.log("APP-LOGIN-VALIDATE-RESEND: OK");
						
					response.writeHead(200, {"Content-Type": "text/html"});
					response.write("Sent OK");
					
				} else {
					if (data == "INCORRECT") {
						console.log("APP-LOGIN-VALIDATE-RESEND: Incorrect");
						
						response.writeHead(409, {"Content-Type": "text/html"});
						response.write("User already validated, not active, or not existing email");
						
					} else {
						console.log("APP-LOGIN-VALIDATE-RESEND: Error while performing query");
						
						response.writeHead(500, {"Content-Type": "text/html"});
						response.write("Sorry, DB error!");
					}
				}
				response.end();
			}
		);
	});
	
	//remember passwd
	/**
	 * @swagger
	 * /login/remember:
	 *   post:
	 *     tags:
	 *       - Login
	 *     description: Sends a new password to the user's email
	 *     parameters:
	 *       - name: useremail
	 *         in: body
	 *         required: true
	 *         description: The user email
	 *         schema:
	 *           $ref: "#/definitions/UserEmail"
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: New password sent
	 *       409:
	 *         description: User not validated, not active, or not existing email
	 *       500:
	 *         description: DB error
	 */
	app.post("/login/remember", function(request, response) {
		
		console.log("APP-LOGIN-REMEMBER: Resending password to user " + request.body.email);
		
		var accountID = {
			"email": request.body.email
		};
		
		login.rememberPasswd(accountID, function (err, data){
				if(!err){	
					console.log("APP-LOGIN-REMEMBER: OK");
						
					response.writeHead(200, {"Content-Type": "text/html"});
					response.write("Password sent OK");
					
				} else {
					if (data == "INCORRECT") {
						console.log("APP-LOGIN-REMEMBER: Incorrect");
						
						response.writeHead(409, {"Content-Type": "text/html"});
						response.write("User not validated, not active, or not existing email");
						
					} else {
						console.log("APP-LOGIN-REMEMBER: Error while performing query");
						
						response.writeHead(500, {"Content-Type": "text/html"});
						response.write("Sorry, DB error!");
					}
				}
				response.end();
			}
		);
	});
	
	//first login
	/**
	 * @swagger
	 * /login/firstlogin:
	 *   post:
	 *     tags:
	 *       - Login
	 *     description: Changes the password
	 *     parameters:
	 *       - name: emailAndPasswordSet
	 *         in: body
	 *         required: true
	 *         description: The user email, and the OLD and NEW passwords
	 *         schema:
	 *           $ref: "#/definitions/FirstLogin"
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: New password sent
	 *       409:
	 *         description: User not validated, not active, or not existing email
	 *       500:
	 *         description: DB error
	 */
	app.post("/login/firstlogin", function(request, response) {
		
		console.log("APP-LOGIN-FIRSTLOGIN: Changing password to user " + request.body.email);
		
		var accountID = {
			"email": request.body.email,
			'oldPasswd': request.body.oldPasswd,
			'newPasswd': request.body.newPasswd
		};
		
		login.firstLogin(accountID, function (err, data){
				if(!err){	
					console.log("APP-LOGIN-FIRSTLOGIN: OK");
						
					response.writeHead(200, {"Content-Type": "text/html"});
					response.write("Password changed OK");
					
				} else {
					if (data == "INCORRECT") {
						console.log("APP-LOGIN-FIRSTLOGIN: Incorrect");
						
						response.writeHead(409, {"Content-Type": "text/html"});
						response.write("User not validated, old password not correct, or not existing email");
						
					} else {
						console.log("APP-LOGIN-FIRSTLOGIN: Error while performing query");
						
						response.writeHead(500, {"Content-Type": "text/html"});
						response.write("Sorry, DB error!");
					}
				}
				response.end();
			}
		);
	});
	

	//todas las cuentas
	/**
	 * @swagger
	 * /twitter-accounts:
	 *   get:
	 *     tags:
	 *       - Twitter Accounts
	 *     description: Get information of all twitter accounts (ADMIN)
	 *     parameters:
	 *       - name: token
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
		
		twitterAccounts.getAll(request.headers.token, function (err, data){
				if(!err){	
					console.log("APP-GET-ALL-ACCOUNTS: Accounts found OK");
						
					response.writeHead(200, {"Content-Type": "application/json"});
					response.write(JSON.stringify(data));
				} else {
					if (data == "FORBIDDEN") {
						console.log("APP-GET-ALL-ACCOUNTS: Forbidden");
						
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
	 *       - Twitter Accounts
	 *     description: Get information of a single account (ADMIN)
	 *     parameters:
	 *       - name: token
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
	 *       400:
	 *         description: The provided {id} is not valid
	 *       403:
	 *         description: The user (token) does not have permission on that twitter account (id)
	 *       404:
	 *         description: Unable to find the requested {id}
	 *       500:
	 *         description: Error getting the account information from database
	 */
	app.get("/twitter-accounts/:id", function(request, response) {
		console.log("APP-GET-ACCOUNTS-ID");
		
		twitterAccounts.getAccount(request.params.id, request.headers.token, function (err, data){
				if(!err){
					console.log("APP-GET-ACCOUNTS-ID: Account found OK");
					
					response.writeHead(200, {"Content-Type": "application/json"});
					response.write(JSON.stringify(data));
					
				} else if (data == "ID NOT VALID"){
					console.log("APP-GET-ACCOUNTS-ID: Bad request. ID not valid");
					
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write("Bad request. Twitter account ID not valid");
					
				} else if (data == "FORBIDDEN"){
					console.log("APP-GET-ACCOUNTS-ID: Forbidden");
					
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
	 *       - Twitter Accounts
	 *     description: Create a new twitter account
	 *     parameters:
	 *       - name: token
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
	 *       403:
	 *         description: The user (token) can not be verified
	 *       409:
	 *         description: The account already exists.
	 *       500:
	 *         description: Error inserting the twitter account into the database
	 *       503:
	 *         description: Twitter service unavailable
	 */
	app.post("/twitter-accounts", function(request, response) {
		console.log("APP-POST-ACCOUNT");
		
		var newAccount = {
				"description": request.body.description,
				"information": request.body.information
		};
		
		twitterAccounts.postAccount(request.headers.token, newAccount, function (err, data){
			if(!err){
				console.log("APP-POST-ACCOUNT: OK");
				
				response.writeHead(201, {"Content-Type": "text/html"});
				response.write("Created");
			} else {
				if (data == "DB ERROR") {
					console.log("APP-POST-ACCOUNT: Error while performing query");
					
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Error while performing query");
					
				} else if (data == "FORBIDDEN") {
					console.log("APP-POST-ACCOUNT: Forbidden");
					
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if (data == "TWITTER ERROR") {
					console.log("APP-POST-ACCOUNT: Twitter error");
					
					response.writeHead(503, {"Content-Type": "text/html"});
					response.write("Twitter service unavailable");
					
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
	 *       - Twitter Accounts
	 *     description: Disable a twitter account (ADMIN)
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The twitter account ID 
	 *     produces:
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: The account has been successfully disabled
	 *       400:
	 *         description: The provided {id} is not valid
	 *       403:
	 *         description: The user (token) does not own this twitter account (id)
	 *       404:
	 *         description: Unable to find the requested {id}
	 *       500:
	 *         description: Error deleting twitter account
	 */
	app.delete("/twitter-accounts/:id", function(request, response) {
		console.log("APP-DEL-ACCOUNTS-ID: Requested ACCOUNT-ID is: " + request.params.id);
		
		twitterAccounts.deleteAccount(request.headers.token, request.params.id,
			function (err, res){
				if(!err){
					console.log("APP-DEL-ACCOUNTS-ID: Delete OK");
					
					response.writeHead(200, {"Content-Type": "text/html"});
					response.write("Deleted account");
				} else {
					if (data == "ID NOT VALID"){
					console.log("APP-DEL-ACCOUNTS-ID: Bad request. ID not valid");
					
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write("Bad request. Twitter account ID not valid");
					
				    } else if(res == 'FORBIDDEN'){
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
	
	
	// TWEETS
	
	//publicar tweet
	/**
	 * @swagger
	 * /twitter-accounts/{id}/tweets/publish:
	 *   post:
	 *     tags:
	 *       - Tweets
	 *     description: Publish a new tweet (ADMIN)
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The twitter account ID
	 *       - name: tweet
	 *         in: body
	 *         required: true
	 *         description: The tweet text
	 *         schema:
	 *           $ref: "#/definitions/Tweet"
	 *     produces:
	 *       - text/html
	 *       - application/json
	 *     responses:
	 *       201:
	 *         description: Tweet published
	 *       400:
	 *         description: The provided {id} is not valid
	 *       403:
	 *         description: Given token does not have permission to the provided twitter-account's {id}
	 *       404:
	 *         description: Unable to find the requested twitter account {id}
	 *       503:
	 *         description: Twitter service unavailable
	 */
	app.post("/twitter-accounts/:id/tweets/publish", function(request, response) {
		
		var accountID = {
			'token': request.headers.token,
			'twitterAccountId': request.params.id
		};
		
		console.log("APP-POST-TWEET-PUBLISH: Publishing tweet for account: " + accountID.twitterAccountId);
		
		tweets.publish(accountID, request.body.text, function (err, data){
			
			if(!err){
				console.log("APP-POST-TWEET-PUBLISH: OK");
				response.writeHead(201, {"Content-Type": "text/html"});
				response.write("Published");
				
			} else {
				if (data == "ID NOT VALID"){
					console.log("APP-GET-TWEET-USER-TIMELINE: Bad request. ID not valid");
					
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write("Bad request. Twitter account ID not valid");
					
				} else if(data == "FORBIDDEN"){
					console.log("APP-POST-TWEET-PUBLISH: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if(data == "ACCOUNT NOT FOUND"){
					console.log("APP-POST-TWEET-PUBLISH: Twitter account NOT found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("Twitter account NOT Found");
									
				} else if (data == "TWITTER ERROR") {
					console.log("APP-POST-TWEET-PUBLISH: Twitter error");
					
					response.writeHead(503, {"Content-Type": "text/html"});
					response.write("Twitter service unavailable");
					
				} else {
					console.log("APP-POST-TWEET-PUBLISH: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Sorry, DB Error!");
				}
			}
			response.end();
		});
	});
	
	//programar tweet
	/**
	 * @swagger
	 * /twitter-accounts/{id}/tweets/schedule:
	 *   post:
	 *     tags:
	 *       - Tweets
	 *     description: Create a new scheduled tweet (ADMIN)
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The twitter account ID
	 *       - name: tweet
	 *         in: body
	 *         required: true
	 *         description: The tweet text and the publish date
	 *         schema:
	 *           $ref: "#/definitions/ScheduledTweet"
	 *     produces:
	 *       - text/html
	 *       - application/json
	 *     responses:
	 *       201:
	 *         description: Tweet scheduled
	 *       400:
	 *         description: The provided {id} is not valid 
	 *       403:
	 *         description: Given token does not have permission to the provided twitter-account's {id}
	 *       500:
	 *         description: Error saving scheduled tweet
	 *       503:
	 *         description: Twitter service unavailable
	 */
	app.post("/twitter-accounts/:id/tweets/schedule", function(request, response) {
		
		var accountID = {
			'token': request.headers.token,
			'twitterAccountId': request.params.id
		};
		
		var tweetData = {
			text: request.body.text,
			date: new Date(request.body.date)
		};
		
		console.log("APP-POST-TWEET-PUBLISH: Scheduling tweet for account: " + accountID.twitterAccountId);
		
		tweets.schedule(accountID, tweetData, function (err, data){
			
			if(!err){
				console.log("APP-POST-TWEET-SCHEDULE: OK");
				response.writeHead(201, {"Content-Type": "text/html"});
				response.write("Scheduled");
				
			} else {
				if (data == "ID NOT VALID"){
					console.log("APP-GET-TWEET-SCHEDULE: Bad request. ID not valid");
					
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write("Bad request. Twitter account ID not valid");
					
				} else if(data == "FORBIDDEN"){
					console.log("APP-POST-TWEET-SCHEDULE: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if(data == "ACCOUNT NOT FOUND"){
					console.log("APP-POST-TWEET-SCHEDULE: Twitter account NOT found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("Twitter account NOT Found");
									
				} else if (data == "TWITTER ERROR") {
					console.log("APP-POST-TWEET-SCHEDULE: Twitter error");
					
					response.writeHead(503, {"Content-Type": "text/html"});
					response.write("Twitter service unavailable");
					
				} else {
					console.log("APP-POST-TWEET-SCHEDULE: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Sorry, DB Error!");
				}
			}
			response.end();
		});
	});
	
	//tweeter user timeline
	/**
	 * @swagger
	 * /twitter-accounts/{id}/tweets/user-timeline:
	 *   get:
	 *     tags:
	 *       - Tweets
	 *     description: Gets all the user-timeline-tweets (published by user) for the provided twitter-account's {id} (ADMIN)
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The twitter account ID
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: The user timeline tweet list
	 *       400:
	 *         description: The provided {id} is not valid
	 *       403:
	 *         description: Given token does not have permission to the provided twitter-account's {id}
	 *       404:
	 *         description: Unable to find the requested twitter account {id}
	 *       500:
	 *         description: DB error
	 *       503:
	 *         description: Twitter service unavailable
	 */
	app.get("/twitter-accounts/:id/tweets/user-timeline", function(request, response) {
		
		var accountID = {
			'token': request.headers.token,
			'twitterAccountId': request.params.id
		};
		
		console.log("APP-GET-TWEET-USER-TIMELINE: Retrieving user timeline for account " + request.params.id);
		
		tweets.userTimeline(accountID,	function (err, data){
			
			if(!err){
				console.log("APP-GET-TWEET-USER-TIMELINE: OK");
				response.writeHead(200, {"Content-Type": "application/json"});
				response.write(JSON.stringify(data));
				
			} else {
				if (data == "ID NOT VALID"){
					console.log("APP-GET-TWEET-USER-TIMELINE: Bad request. ID not valid");
					
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write("Bad request. Twitter account ID not valid");
					
				} else if(data == "FORBIDDEN"){
					console.log("APP-GET-TWEET-USER-TIMELINE: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if(data == "ACCOUNT NOT FOUND"){
					console.log("APP-GET-TWEET-USER-TIMELINE: Twitter account NOT found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("Twitter account NOT found");
					
				} else if (data == "TWITTER ERROR") {
					console.log("APP-GET-TWEET-USER-TIMELINE: Twitter error");
					
					response.writeHead(503, {"Content-Type": "text/html"});
					response.write("Twitter service unavailable");
					
				} else {
					console.log("APP-GET-TWEET-USER-TIMELINE: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Sorry, DB Error!");
				}
			}
			response.end();
		});
	});
	
	//tweeter home timeline
	/**
	 * @swagger
	 * /twitter-accounts/{id}/tweets/home-timeline:
	 *   get:
	 *     tags:
	 *       - Tweets
	 *     description: Gets all the home-timeline-tweets (published by followed users) for the provided twitter-account's {id} (ADMIN)
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The twitter account ID
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: The home timeline tweet list
	 *       400:
	 *         description: The provided {id} is not valid
	 *       403:
	 *         description: Given token does not have permission to the provided twitter-account's {id}
	 *       404:
	 *         description: Unable to find the requested twitter account {id}
	 *       500:
	 *         description: DB error
	 *       503:
	 *         description: Twitter service unavailable
	 */
	app.get("/twitter-accounts/:id/tweets/home-timeline", function(request, response) {
		
		var accountID = {
			'token': request.headers.token,
			'twitterAccountId': request.params.id
		};
		
		console.log("APP-GET-TWEET-HOME-TIMELINE: Retrieving home timeline for account " + request.params.id);
		
		tweets.homeTimeline(accountID,	function (err, data){
			
			if(!err){
				console.log("APP-GET-TWEET-HOME-TIMELINE: OK");
				response.writeHead(200, {"Content-Type": "application/json"});
				response.write(JSON.stringify(data));
				
			} else {
				if (data == "ID NOT VALID"){
					console.log("APP-GET-TWEET-HOME-TIMELINE: Bad request. ID not valid");
					
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write("Bad request. Twitter account ID not valid");
					
				} else if(data == "FORBIDDEN"){
					console.log("APP-GET-TWEET-HOME-TIMELINE: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if(data == "ACCOUNT NOT FOUND"){
					console.log("APP-GET-TWEET-HOME-TIMELINE: Twitter account NOT found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("Twitter account NOT found");
					
				} else if (data == "TWITTER ERROR") {
					console.log("APP-GET-TWEET-HOME-TIMELINE: Twitter error");
					
					response.writeHead(503, {"Content-Type": "text/html"});
					response.write("Twitter service unavailable");
					
				} else {
					console.log("APP-GET-TWEET-HOME-TIMELINE: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Sorry, DB Error!");
				}
			}
			response.end();
		});
	});
	
	//scheduled tweets
	/**
	 * @swagger
	 * /twitter-accounts/{id}/tweets/scheduled:
	 *   get:
	 *     tags:
	 *       - Tweets
	 *     description: Gets all the scheduled-tweets for the provided twitter-account's {id} (ADMIN)
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The twitter account ID
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: The scheduled tweet list
	 *       400:
	 *         description: The provided {id} is not valid
	 *       403:
	 *         description: Given token does not have permission to the provided twitter-account's {id}
	 *       404:
	 *         description: Unable to find the requested twitter account {id}
	 *       500:
	 *         description: DB error
	 *       503:
	 *         description: Twitter service unavailable
	 */
	app.get("/twitter-accounts/:id/tweets/scheduled", function(request, response) {
		
		var accountID = {
			'token': request.headers.token,
			'twitterAccountId': request.params.id
		};
		
		console.log("APP-GET-TWEET-SCHEDULED: Retrieving scheduled tweets for account " + request.params.id);
		
		tweets.scheduled(accountID, function (err, data){
			
			if(!err){
				console.log("APP-GET-TWEET-SCHEDULED: OK");
				response.writeHead(200, {"Content-Type": "application/json"});
				response.write(JSON.stringify(data));
				
			} else {
				if (data == "ID NOT VALID"){
					console.log("APP-GET-TWEET-SCHEDULED: Bad request. ID not valid");
					
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write("Bad request. Twitter account ID not valid");
					
				} else if(data == "FORBIDDEN"){
					console.log("APP-GET-TWEET-SCHEDULED: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if(data == "ACCOUNT NOT FOUND"){
					console.log("APP-GET-TWEET-SCHEDULED: Twitter account NOT found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("Twitter account NOT found");
					
				} else if (data == "TWITTER ERROR") {
					console.log("APP-GET-TWEET-SCHEDULED: Twitter error");
					
					response.writeHead(503, {"Content-Type": "text/html"});
					response.write("Twitter service unavailable");
					
				} else {
					console.log("APP-GET-TWEET-SCHEDULED: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Sorry, DB Error!");
				}
			}
			response.end();
		});
	});
	
	//mentions
	/**
	 * @swagger
	 * /twitter-accounts/{id}/tweets/mentions:
	 *   get:
	 *     tags:
	 *       - Tweets
	 *     description: Gets all the tweets containing mentions for the provided twitter-account's {id} (ADMIN)
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The twitter account ID
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: The mentions tweet list
	 *       400:
	 *         description: The provided {id} is not valid
	 *       403:
	 *         description: Given token does not have permission to the provided twitter-account's {id}
	 *       404:
	 *         description: Unable to find the requested twitter account {id}
	 *       500:
	 *         description: DB error
	 *       503:
	 *         description: Twitter service unavailable
	 */
	app.get("/twitter-accounts/:id/tweets/mentions", function(request, response) {
		
		var accountID = {
			'token': request.headers.token,
			'twitterAccountId': request.params.id
		};
		
		console.log("APP-GET-TWEET-MENTIONS: Retrieving tweets containing mentions to account " + request.params.id);
		
		tweets.mentions(accountID, function (err, data){
			
			if(!err){
				console.log("APP-GET-TWEET-MENTIONS: OK");
				response.writeHead(200, {"Content-Type": "application/json"});
				response.write(JSON.stringify(data));
				
			} else {
				if (data == "ID NOT VALID"){
					console.log("APP-GET-TWEET-MENTIONS: Bad request. ID not valid");
					
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write("Bad request. Twitter account ID not valid");
					
				} else if(data == "FORBIDDEN"){
					console.log("APP-GET-TWEET-MENTIONS: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if(data == "ACCOUNT NOT FOUND"){
					console.log("APP-GET-TWEET-MENTIONS: Twitter account NOT found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("Twitter account NOT found");
					
				} else if (data == "TWITTER ERROR") {
					console.log("APP-GET-TWEET-MENTIONS: Twitter error");
					
					response.writeHead(503, {"Content-Type": "text/html"});
					response.write("Twitter service unavailable");
					
				} else {
					console.log("APP-GET-TWEET-MENTIONS: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Sorry, DB Error!");
				}
			}
			response.end();
		});
	});
	
	//tweets retuiteados
	/**
	 * @swagger
	 * /twitter-accounts/{id}/tweets/retweeted:
	 *   get:
	 *     tags:
	 *       - Tweets
	 *     description: Gets all the retweeted tweets for the provided twitter-account's {id} (ADMIN)
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The twitter account ID
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: The retweeted tweet list
	 *       400:
	 *         description: The provided {id} is not valid
	 *       403:
	 *         description: Given token does not have permission to the provided twitter-account's {id}
	 *       404:
	 *         description: Unable to find the requested twitter account {id}
	 *       500:
	 *         description: DB error
	 *       503:
	 *         description: Twitter service unavailable
	 */
	app.get("/twitter-accounts/:id/tweets/retweeted", function(request, response) {
		
		var accountID = {
			'token': request.headers.token,
			'twitterAccountId': request.params.id
		};
		
		console.log("APP-GET-TWEET-RETWEETED: Retrieving retweeted tweets for account " + request.params.id);
		
		tweets.retweeted(accountID, function (err, data){
			
			if(!err){
				console.log("APP-GET-TWEET-RETWEETED: OK");
				response.writeHead(200, {"Content-Type": "application/json"});
				response.write(JSON.stringify(data));
				
			} else {
				if (data == "ID NOT VALID"){
					console.log("APP-GET-TWEET-RETWEETED: Bad request. ID not valid");
					
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write("Bad request. Twitter account ID not valid");
					
				} else if(data == "FORBIDDEN"){
					console.log("APP-GET-TWEET-RETWEETED: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if(data == "ACCOUNT NOT FOUND"){
					console.log("APP-GET-TWEET-RETWEETED: Twitter account NOT found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("Twitter account NOT found");
					
				} else if (data == "TWITTER ERROR") {
					console.log("APP-GET-TWEET-RETWEETED: Twitter error");
					
					response.writeHead(503, {"Content-Type": "text/html"});
					response.write("Twitter service unavailable");
					
				} else {
					console.log("APP-GET-TWEET-MENTIONS: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Sorry, DB Error!");
				}
			}
			response.end();
		});
	});
	
	//tweets marcados favoritos
	/**
	 * @swagger
	 * /twitter-accounts/{id}/tweets/favorited:
	 *   get:
	 *     tags:
	 *       - Tweets
	 *     description: Gets all the favorited tweets for the provided twitter-account's {id} (ADMIN)
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The twitter account ID
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: The favorited tweet list
	 *       400:
	 *         description: The provided {id} is not valid
	 *       403:
	 *         description: Given token does not have permission to the provided twitter-account's {id}
	 *       404:
	 *         description: Unable to find the requested twitter account {id}
	 *       500:
	 *         description: DB error
	 *       503:
	 *         description: Twitter service unavailable
	 */
	app.get("/twitter-accounts/:id/tweets/favorited", function(request, response) {
		
		var accountID = {
			'token': request.headers.token,
			'twitterAccountId': request.params.id
		};
		
		console.log("APP-GET-TWEET-FAVORITED: Retrieving favorited tweets for account " + request.params.id);
		
		tweets.favorited(accountID, function (err, data){
			
			if(!err){
				console.log("APP-GET-TWEET-FAVORITED: OK");
				response.writeHead(200, {"Content-Type": "application/json"});
				response.write(JSON.stringify(data));
				
			} else {
				if (data == "ID NOT VALID"){
					console.log("APP-GET-TWEET-FAVORITED: Bad request. ID not valid");
					
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write("Bad request. Twitter account ID not valid");
					
				} else if(data == "FORBIDDEN"){
					console.log("APP-GET-TWEET-FAVORITED: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if(data == "ACCOUNT NOT FOUND"){
					console.log("APP-GET-TWEET-FAVORITED: Twitter account NOT found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("Twitter account NOT found");
					
				} else if (data == "TWITTER ERROR") {
					console.log("APP-GET-TWEET-FAVORITED: Twitter error");
					
					response.writeHead(503, {"Content-Type": "text/html"});
					response.write("Twitter service unavailable");
					
				} else {
					console.log("APP-GET-TWEET-MENTIONS: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Sorry, DB Error!");
				}
			}
			response.end();
		});
	});
	
	//HASHTAGS
	
	/**
	 * @swagger
	 * /twitter-accounts/{id}/hashtags:
	 *   get:
	 *     tags:
	 *       - Hashtags
	 *     description: Gets all hashtags for the provided twitter-account's {id} (ADMIN)
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
	 *       400:
	 *         description: The provided {id} is not valid
	 *       403:
	 *         description: Given token does not have permission to the provided twitter-account's {id}
	 *       404:
	 *         description: Unable to find the requested twitter account {id}
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
				if (data == "ID NOT VALID"){
					console.log("APP-GET-ALL-HASHTAGS: Bad request. ID not valid");
					
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write("Bad request. Twitter account ID not valid");
					
				} else if(data == "FORBIDDEN"){
					console.log("APP-GET-ALL-HASHTAGS: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if(data == "ACCOUNT NOT FOUND"){
					console.log("APP-GET-ALL-HASHTAGS: Twitter account NOT found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("Twitter account NOT found");
					
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
	 *       - Hashtags
	 *     description: Gets the hashtag info for the provided (twitter-account's {id}, {hashtag}) (ADMIN)
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
	 *       400:
	 *         description: The provided {id} is not valid
	 *       403:
	 *         description: Given token does not own the provided twitter-account's {id}
	 *       404:
	 *         description: Not found {id} OR {hashtag}
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
				if (data == "ID NOT VALID"){
					console.log("APP-GET-HASHTAGS: Bad request. ID not valid");
					
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write("Bad request. Twitter account ID not valid");
					
				} else if(data == "FORBIDDEN"){
					console.log("APP-GET-HASHTAGS: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if(data == "ACCOUNT NOT FOUND"){
					console.log("APP-GET-HASHTAGS: Twitter account NOT found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("Twitter account NOT Found");
									
				} else if(data == "NOT FOUND"){
					console.log("APP-GET-HASHTAGS: Hashtag NOT found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("Hashtag NOT Found");
									
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
	 *       - Hashtags
	 *     description: Creates a new hashtag for the provided twitter-account's {id} (ADMIN)
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
	 *       400:
	 *         description: The provided {id} is not valid
	 *       403:
	 *         description: Given token does not own the provided twitter-account's {id}
	 *       404:
	 *         description: Unable to find the requested twitter account {id}
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
				if (data == "ID NOT VALID"){
					console.log("APP-POST-HASHTAG: Bad request. ID not valid");
					
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write("Bad request. Twitter account ID not valid");
					
				} else if(data == "FORBIDDEN"){
					console.log("APP-POST-HASHTAG: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if(data == "ALREADY EXISTS"){
					console.log("APP-POST-HASHTAG: Conflict. Already exists!!!");
					response.writeHead(409, {"Content-Type": "text/html"});
					response.write("Hashtag already exists for the provided twitter account");
									
				} else if(data == "ACCOUNT NOT FOUND"){
					console.log("APP-POST-HASHTAGS: Twitter account NOT found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("Twitter account NOT Found");
									
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
	 *       - Hashtags
	 *     description: Deletes the specified {hashtag} for the provided twitter-account's {id} (ADMIN)
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
	 *       400:
	 *         description: The provided {id} is not valid
	 *       403:
	 *         description: Given token does not own the provided twitter-account's {id}
	 *       404:
	 *         description: Not found {id} OR {hashtag}
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
				if (data == "ID NOT VALID"){
					console.log("APP-DELETE-HASHTAG: Bad request. ID not valid");
					
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write("Bad request. Twitter account ID not valid");
					
				} else if(data == "FORBIDDEN"){
					console.log("APP-DELETE-HASHTAG: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if(data == "NOT EXIST"){
					console.log("APP-DELETE-HASHTAG: Hashtag NOT found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("Hashtag NOT found");
								
				} else if(data == "ACCOUNT NOT FOUND"){
					console.log("APP-DELETE-HASHTAG: Twitter account NOT found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("Twitter account NOT Found");
									
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
     *       - Followed
     *     description: Gets all followed users for the provided twitter-account's {id} (ADMIN)
     *     parameters:
     *       - name: token
     *         in: header
     *         required: true
     *         description: The user token
     *       - name: id
     *         in: path
     *         required: true
     *         description: The twitter account ID that owns the followed users list
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
     *       - Followed
     *     description: Gets the followed user info for the provided (twitter-account's {id}, {user}) (ADMIN)
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
     *       - Followed
     *     description: Creates a new followed user for the provided twitter-account's {id} (ADMIN)
     *     parameters:
     *       - name: token
     *         in: header
     *         required: true
     *         description: The user token
     *       - name: id
     *         in: path
     *         required: true
     *         description: The twitter account ID that owns the followed users list
     *       - name: newuser
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
	        
	    console.log("APP-POST-FOLLOWED-USERS: Creating user " + request.body.newuser + " for (token: " + accountID.token + ", twitterAccountId: " + accountID.twitterAccountId + ")");
	        
        followedUsers.post(accountID, request.body.newuser, function (err, data){
            
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
     * /twitter-accounts/{id}/followed-users/{user}:
     *   delete:
     *     tags:
     *       - Followed
     *     description: Deletes the specified {user} for the provided twitter-account's {id} (ADMIN)
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
	                response.write("Followed user does not exist for the provided twitter account"); 

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
	
	/**
	 * @swagger
	 * /users:
	 *   get:
	 *     tags:
	 *       - Users
	 *     description: Gets all users (ADMIN ONLY)
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: The user list
	 *       403:
	 *         description: Given token does not have permission to do this
	 *       500:
	 *         description: DB error
	 */
	app.get("/users", function(request, response) {
		
		var accountID = {
			'token': request.headers.token
		};
		
		console.log("APP-GET-ALL-USERS: Retrieving all users");
		
		userAccounts.getAll(accountID,	function (err, data){
			
			if(!err){
				console.log("APP-GET-ALL-USERS: OK");
				response.writeHead(200, {"Content-Type": "application/json"});
				response.write(JSON.stringify(data));
				
			} else {
				if(data == "FORBIDDEN"){
					console.log("APP-GET-ALL-USERS: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else {
					console.log("APP-GET-ALL-USERS: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Sorry, DB Error!");
				}
			}
			response.end();
		});
	});
	
	/**
	 * @swagger
	 * /users/{id}:
	 *   get:
	 *     tags:
	 *       - Users
	 *     description: Gets the user info (except password) (ADMIN)
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The user {id}
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: The user info
	 *       400:
	 *         description: The provided {id} is not valid
	 *       403:
	 *         description: Given token does not have permission to do this
	 *       404:
	 *         description: Unable to find the requested user {id}
	 *       500:
	 *         description: DB error
	 */
	app.get("/users/:id", function(request, response) {
		
		var accountID = {
			'token': request.headers.token,
			'userAccountId': request.params.id
		};
		
		console.log("APP-GET-USER-ID: Retrieving user " + accountID.userAccountId);
		
		userAccounts.get(accountID, function (err, data){
			
			if(!err){
				console.log("APP-GET-USER-ID: OK");
				response.writeHead(200, {"Content-Type": "application/json"});
				response.write(JSON.stringify(data));
				
			} else {
				if (data == "ID NOT VALID"){
					console.log("APP-GET-USER-ID: Bad request. ID not valid");
					
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write("Bad request. User account ID not valid");
					
				} else if(data == "FORBIDDEN"){
					console.log("APP-GET-USER-ID: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if(data == "USER NOT FOUND"){
					console.log("APP-GET-USER-ID: User account NOT found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("User account NOT Found");
									
				} else {
					console.log("APP-GET-USER-ID: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Sorry, DB Error!");
				}
			}
			response.end();
		});

	});
	
	/**
	 * @swagger
	 * /users/{id}:
	 *   put:
	 *     tags:
	 *       - Users
	 *     description: Updates user password
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The user {id}
	 *       - name: passwordSet
	 *         in: body
	 *         required: true
	 *         description: The OLD and the NEW passwords
	 *         schema:
	 *           $ref: "#/definitions/Passwords"
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: The user info
	 *       400:
	 *         description: The provided {id} is not valid
	 *       401:
	 *         description: The provided {oldPasswd} does not match the one in DB
	 *       403:
	 *         description: Given token does not have permission to do this
	 *       404:
	 *         description: Unable to find the requested user {id}
	 *       500:
	 *         description: DB error
	 */
	app.put("/users/:id", function(request, response) {
		
		var accountID = {
			'token': request.headers.token,
			'userAccountId': request.params.id
		};
		
		var passwordSet = {
			'oldPasswd': request.body.oldPasswd,
			'newPasswd': request.body.newPasswd
		};
		
		console.log("APP-PUT-USER: Updating password for user " + accountID.userAccountId);
		
		userAccounts.put(accountID, passwordSet, function (err, data){
			
			if(!err){
				console.log("APP-PUT-USER: OK");
				response.writeHead(200, {"Content-Type": "application/json"});
				//response.write(JSON.stringify(data));
				
			} else {
				if (data == "ID NOT VALID"){
					console.log("APP-PUT-USER: Bad request. ID not valid");
					
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write("Bad request. User account ID not valid");
					
				} else if (data == "INCORRECT PASSWD"){
					console.log("APP-PUT-USER: Unauthorized. OLD passwd does not match");
					
					response.writeHead(401, {"Content-Type": "text/html"});
					response.write("Unauthorized. OLD passwd does not match");
					
				} else if(data == "FORBIDDEN"){
					console.log("APP-PUT-USER: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if(data == "USER NOT FOUND"){
					console.log("APP-PUT-USER: User account NOT found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("User account NOT Found");
									
				} else {
					console.log("APP-PUT-USER: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Sorry, DB Error!");
				}
			}
			response.end();
		});

	});
	
	/**
	 * @swagger
	 * /users/{id}:
	 *   delete:
	 *     tags:
	 *       - Users
	 *     description: Deletes de user (ADMIN)
	 *     parameters:
	 *       - name: token
	 *         in: header
	 *         required: true
	 *         description: The user token
	 *       - name: id
	 *         in: path
	 *         required: true
	 *         description: The user {id}
	 *     produces:
	 *       - application/json
	 *       - text/html
	 *     responses:
	 *       200:
	 *         description: User deleted
	 *       400:
	 *         description: The provided {id} is not valid
	 *       403:
	 *         description: Given token does not have permission to do this
	 *       404:
	 *         description: Unable to find the requested user {id}
	 *       500:
	 *         description: DB error
	 */
	app.delete("/users/:id", function(request, response) {
		
		var accountID = {
			'token': request.headers.token,
			'userAccountId': request.params.id
		};
		
		console.log("APP-DELETE-USER: Deleting user " + accountID.userAccountId);
		
		userAccounts.delete(accountID, function (err, data){
			
			if(!err){
				console.log("APP-DELETE-USER: OK");
				response.writeHead(200, {"Content-Type": "application/json"});
				//response.write(JSON.stringify(data));
				
			} else {
				if (data == "ID NOT VALID"){
					console.log("APP-DELETE-USER: Bad request. ID not valid");
					
					response.writeHead(400, {"Content-Type": "text/html"});
					response.write("Bad request. User account ID not valid");
					
				} else if(data == "FORBIDDEN"){
					console.log("APP-DELETE-USER: Forbidden!!!");
					response.writeHead(403, {"Content-Type": "text/html"});
					response.write("Forbidden");
					
				} else if(data == "USER NOT FOUND"){
					console.log("APP-DELETE-USER: User account NOT found!!!");
					response.writeHead(404, {"Content-Type": "text/html"});
					response.write("User account NOT Found");
									
				} else {
					console.log("APP-DELETE-USER: DB ERROR!!!");
					response.writeHead(500, {"Content-Type": "text/html"});
					response.write("Sorry, DB Error!");
				}
			}
			response.end();
		});
		
	});
	
	//STATS
	app.get("/stats/hashtags", function(request, response) {


	});
	
	app.get("/stats/followed-users", function(request, response) {


	});
	
	app.get("/stats/users", function(request, response) {


	});
	
	 /**
     * @swagger
     * /stats/app:
     *   get:
     *     tags:
     *       - Statistics 
     *     description: Get application statistics (ADMIN)
     *     parameters:
     *       - name: token
     *         in: header
     *         required: true
     *         description: The user token
     *     produces:
     *       - application/json
     *       - text/html
     *     responses:
     *       200:
     *         description: Statistics of last accesses, registries and downs
     *       403:
     *         description: Forbidden
     */
	app.get("/stats/app", function(request, response) {

	    console.log("APP-GET-ADMIN-STATS: Request stats.");
	    var accountID = { "token" : request.headers.token };
	    
	    adminStats.get(accountID, function(err, res){
	        if(!err){
	            console.log("APP-GET-ADMIN-STATS: OK ");
	            
	            response.writeHead(200, {"Content-Type": "application/json"});
	            response.write(JSON.stringify(res));
	        } else {
	            console.log("APP-GET-ADMIN-STATS: Forbidden!!!");
	            
	            response.writeHead(403, {"Content-Type": "text/html"});
                response.write("Forbidden");
	        }
	        response.end();
	    });
	});
	
	//ACORTAR URL
	/**
	 * @swagger
	 * /urls/{id}:
	 *   get:
	 *     tags:
	 *       - URL shortener
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
	 *       - URL shortener
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
	
	//IMAGENES
	 /**
     * @swagger
     * /images/{id}:
     *   get:
     *     tags:
     *       - Images
     *     description: Request an image associated with the provided {id}
     *     parameters:
     *       - name: id
     *         in: path
     *         required: true
     *         description: The image name
     *         type: string
     *     produces:
     *       - image/png
     *       - text/html
     *     responses:
     *       200:
     *         description: The image associated with the provided {id}
     *       404:
     *         description: Unable to find the requested {id}
     *       500:
     *         description: Error getting the image
     */
	app.get("/images/:id", function(request, response) {
	    
	    console.log("APP-GET-IMAGE: Requesting an image...");
	    
	    uploadImages.get(request.params.id, function(err,res){
	        if(!err){
                console.log("APP-GET-IMAGE: Obtained image.");
                
                response.writeHead(200, {"Content-Type": "image/png"});
                response.write(res);
                
            } else {
                if (res == "NOT FOUND"){
                    console.log("APP-GET-IMAGE: Not found data.");
                    
                    response.writeHead(404, {"Content-Type": "text/html"});
                    response.write("Not found.");
                } else {
                    console.log("APP-GET-IMAGE: Error while saving the image.");
                    
                    response.writeHead(500, {"Content-Type": "text/html"});
                    response.write("Error.");
                }
            }
	        response.end();
	    });
	});
	
    /**
     * @swagger
     * /images:
     *   post:
     *     tags:
     *       - Images
     *     description: Store an image 
     *     parameters:
     *       - name: image
     *         in: formData
     *         required: true
     *         description: The image file
     *         type: file
     *     produces:
     *       - text/html
     *     responses:
     *       201:
     *         description: Image saved on the server
     *       500:
     *         description: Error saving the image
     */
    app.post("/images", function(request, response) {

        var form = new formidable.IncomingForm().parse(request).on('file', function (name, image){

              console.log("APP-POST-IMAGE: Received image.");

              uploadImages.post(image, function (err, res){
                  if(!err){
                      console.log("APP-POST-IMAGE: Image saved.");

                      response.writeHead(201, {"Content-Type": "text/html"});
                      response.write("Image saved (" + res + ").");

                  } else {
                      console.log("APP-POST-IMAGE: Error while saving the image.");

                      response.writeHead(500, {"Content-Type": "text/html"});
                      response.write("Error.");
                  }
                  response.end();
              });
            });
    });
    
    /**
     * @swagger
     * /verify-captcha:
     *   post:
     *     tags:
     *       - Captcha
     *     description: Verify the captcha result
     *     parameters:
     *       - name: captcha-response
     *         in: body
     *         required: true
     *         description: The google recaptcha response
     *         schema:
	 *           $ref: "#/definitions/GoogleCaptchaResponse"
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Captcha response (verified or not)
     *       503:
     *         description: Captcha service unavailable
     */
    app.post("/verify-captcha", function(request, response){
		
		console.log("APP-VERIFY-CAPTCHA: Verifying captcha response");
		
		verifyCaptcha.verify(request.body['g-recaptcha-response'], request.connection.remoteAddress,
			function(err, data){
				
				if(!err){
					console.log("APP-VERIFY-CAPTCHA: OK");
					
					response.writeHead(200, {"Content-Type": "application/json"});
					response.write(JSON.stringify({"responseCode": 0, "responseDesc": data}));
				} else {
					
					if(data == "CAPTCHA ERROR"){
						console.log("APP-VERIFY-CAPTCHA: Captcha service unavailable");
						
						response.writeHead(503, {"Content-Type": "text/html"});
						response.write("Captcha service unavailable");
						
					} else {
						console.log("APP-VERIFY-CAPTCHA: " + data);
						
						response.writeHead(200, {"Content-Type": "application/json"});
						response.write(JSON.stringify({"responseCode": 1, "responseDesc": data}));
					}
				}
				
				response.end();
			}
		);
	});
};

module.exports = appRouter;
