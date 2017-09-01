var app_admin = angular.module('app_admin');
// Password Data and Check
app_admin.controller('PasswordController', function ($scope,$http,$location,vcRecaptchaService) {
	$http.get('config.json').
	then(function onSuccess(response) {
		localStorage.setItem('api', response.data.api);
		localStorage.setItem('port', response.data.apiPort);
	}).
	catch(function onError(response) {
		console.log("Error getting API");
	});
    $scope.pwdError =false;
    var vm = this;
	if (localStorage.getItem('token_admin')) {
		$location.path('/admin-main-panel');
	}
	$scope.setWidgetId = function(widgetId) {
		if ($scope.recaptchaId==undefined) {
			$scope.recaptchaId=widgetId;
		}
	};
	$scope.checkPwd =function() {
		var data = {
			'email': 'admin@admin.com',
			'passwd': $scope.password,
			'g-recaptcha-response': vcRecaptchaService.getResponse($scope.recaptchaId),
			'loginType' : 'local'
		};
		$http.post(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/login/signin',data).then(successCallback, errorCallback);
		function successCallback(response){
			localStorage.setItem('token_admin', response.data.token);
			$location.path('/admin-main-panel');
		}
		function errorCallback(error){
			var error_msg = "Error " + error.status + ": " + error.data;
			$scope.error = error_msg;
			$scope.pwdError = true;
		}
	};
});

// List of Users Data
app_admin.controller('UserController', function($scope,$http,$location,$window) {
	$http.get(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/users',{headers: {'token': localStorage.getItem('token_admin')}}).then(successCallback, errorCallback);
	function successCallback(response){
		//Get response data
		var users=response.data;
		var usersArr = eval( users );
		var data = [];
		for ( var i = 0; i < usersArr.length; i++ ) {
			if (usersArr[i].lastAccess == null) {
				var user= {
					"_id": usersArr[i]._id,
					"email": usersArr[i].email,
					"registrationDate" : formatDate(new Date(usersArr[i].registrationDate)),
					"last" : "User doesnt enter yet"
				};
				data.push(user);
			}
			else {
				if (usersArr[i].email=="admin@admin.com") {}
				else {
					var user= {
						"_id": usersArr[i]._id,
						"email": usersArr[i].email,
						"registrationDate" : formatDate(new Date(usersArr[i].registrationDate)),
						"last" : formatDate(new Date(usersArr[i].lastAccess))
					};
					data.push(user);
				}
			}
			
		}
		// Bind User data
		$scope.users=data;
		
		// RemoveUser from the list
		$scope.removeUser =function(user) {
			$http.delete(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/users/'+user._id,{headers: {'token': localStorage.getItem('token_admin')}}).then(successCallback, errorCallback);
			function successCallback(response){
				var index = -1;		
				var usersArr = eval( $scope.users );
				for( var i = 0; i < usersArr.length; i++ ) {
					if( usersArr[i]._id === user._id ) {
						index = i;
						break;
					}
				}
				$scope.users.splice( index, 1 );
			}
			function errorCallback(error){
				console.log("Error Removing User");
				var error_msg = "Error " + error.status + ": " + error.data;
				alert(error_msg);
			}
		}
	}
	function errorCallback(error){
		console.log("Error getting Users list");
		if (error.status == "403") {
			localStorage.removeItem('token_admin');
			$location.path('/admin');
		}
		else {
			var error_msg = "Error " + error.status + ": " + error.data;
			alert(error_msg);
		}
	}
});

// Accounts and Hastags Data Binding
app_admin.controller('AccountController', function($scope,$http,$location) {
	// Get accounts data 
	$http.get(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts',{headers: {'token': localStorage.getItem('token_admin')}}).then(successCallback, errorCallback);
	//Data Get Successfull
	function successCallback(response){
		$scope.accounts = response.data;
		// Show information of an account
		$scope.showInfo =function(account) {
			$scope.user_select=account.email;
			$scope.account_select=account.name;
			$scope.account_description=account.description;
			// Get Hashtag Data from the account
			$http.get(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'+account._id+'/hashtags',{headers: {'token': localStorage.getItem('token_admin')}}).then(successCallbackHastags, errorCallbackHastags);
			function successCallbackHastags(hashtags){
				var index = -1;
				var comArr = eval( hashtags.data );
				var result='';
				// Format Hashtag list for the user
				for( var i = 0; i < comArr.length; i++ ) {
					result=result+"#"+comArr[i].hashtag+'\n';
				}
				$scope.hashtags_select=result;
			}
			function errorCallbackHastags(error){
				console.log("Error getting hashtags");
				var error_msg = "Error " + error.status + ": " + error.data;
				alert(error_msg);
			}
			// Get Followed Users from the account
			$http.get(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'+account._id+'/followed-users',{headers: {'token': localStorage.getItem('token_admin')}}).then(successCallbackFollowed, errorCallbackFollowed);
			function successCallbackFollowed(twitter_accounts){
				var index = -1;
				var comArr = eval( twitter_accounts.data );
				var result='';
				// Format Hashtag list for the user
				for( var i = 0; i < comArr.length; i++ ) {
					result=result+comArr[i].user+'\n';
				}
				$scope.followed_select=result;
			}
			function errorCallbackFollowed(error){
				console.log("Error getting followed users");
				var error_msg = "Error " + error.status + ": " + error.data;
				alert(error_msg);
			}
			
		// RemoveAccount from the list
		$scope.removeAccount =function(account) {
			$http.delete(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/twitter-accounts/'+account._id,{headers: {'token': localStorage.getItem('token_admin')}}).then(successCallback, errorCallback);
			function successCallback(response){
				var index = -1;		
				var accArr = eval( $scope.accounts );
				for( var i = 0; i < accArr.length; i++ ) {
					if( accArr[i]._id === account._id ) {
						index = i;
						break;
					}
				}
				$scope.accounts.splice( index, 1 );
			}
			function errorCallback(error){
				console.log("Error Removing Account");
				var error_msg = "Error " + error.status + ": " + error.data;
				alert(error_msg);
			}
		};
	}}
	function errorCallback(error){
		console.log("Error getting user accounts");
		if (error.status == "403") {
			localStorage.removeItem('token_admin');
			$location.path('/admin');
		}
		else {
			var error_msg = "Error " + error.status + ": " + error.data;
			alert(error_msg);
		}
	}
});

// Statistics Data

// Support Functions for parsing dates
app_admin.factory('DateService', function() {
    return {
        // Return String Name month corresponding to a number
        getMonthName: function(date) {
            var monthNames = [
                "January", "February", "March",
                "April", "May", "June", "July",
                "August", "September", "October",
                "November", "December"
            ];
            return monthNames[date];
        },
        // Return an array with last 12 month dates of date. [month, year, data1,data2]
        getArrayLastTwelve: function(date) {
            var arr = [];
            var month=date.getMonth();
            var year=date.getFullYear();
            for (var i = 12; i > 0; i--) {
                arr[i-1]=[month,year,0,0];
                month--;
                if(month<0) {
                    month=11;
                    year--;
                }
            };
            return arr;
        }
    };
})
// User Iputs and Outputs from the Application Data
app_admin.controller('UserDoorController', function($scope,$http,$location,DateService) {
    // Get data Statistics from the server
    $http.get(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/stats/app',{headers: {'token': localStorage.getItem('token_admin')}}).then(successCallbackStats, errorCallbackStats);
    function successCallbackStats(stats){
        var registrationData= stats.data.ups;	// Registration Data
        var downsData= stats.data.downs;					// Downs Data
        var label=[];
        var data=[];
        var date_now=new Date();
        // Fill last twelve dates with Downs and Registration Statistics
        var lastTwelve = DateService.getArrayLastTwelve(date_now);
        for( var key in registrationData) {
            var year = key;
            // Search last twelve months
            if (year == lastTwelve[0][1] || year == lastTwelve[11][1]) {
                var registrationDataYear=registrationData[key];
                for (var i = 0; i < registrationDataYear.length; i++) {
                    var month= registrationDataYear[i].month-1;
                    for (var j = 0; j < lastTwelve.length; j++) {
                        if (month == lastTwelve[j][0]) {
                            // Fill registrationdata
                            lastTwelve[j][2]=registrationDataYear[i].data;
                        }
                    }
                }
            }
        }
        for( var key in downsData) {
            var year = key;
            // Search last twelve months
            if (year == lastTwelve[0][1] || year == lastTwelve[11][1]) {
                var downsDataYear=downsData[key];
                for (var i = 0; i < downsDataYear.length; i++) {
                    var month= downsDataYear[i].month-1;
                    for (var j = 0; j < lastTwelve.length; j++) {
                        if (month == lastTwelve[j][0]) {
                            // Fill downdata
                            lastTwelve[j][3]=downsDataYear[i].data;
                        }
                    }
                }
            }
        }
        data1=[];	// Registration
        data2=[];	// Down
        // Fill label and data of the chart
        for (var i = 0; i < lastTwelve.length; i++) {
            var month= DateService.getMonthName(lastTwelve[i][0]);
            var date = month+", "+lastTwelve[i][1];
            label.push(date);
            data1.push(lastTwelve[i][2]);
            data2.push(lastTwelve[i][3]);
        }
        $scope.labels = label;
        $scope.data = [data1,data2];
        $scope.series = ['Ups', 'Downs'];
        $scope.options = {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    }
    function errorCallbackStats(error){
        console.log("Error getting stats");
        if (error.status == "403") {
			localStorage.removeItem('token_admin');
			$location.path('/admin');
		}
		else {
			var error_msg = "Error " + error.status + ": " + error.data;
			alert(error_msg);
		}
    }
});


// User Last Connection Time Data
app_admin.controller('AccessDataController', function($scope,$http,$location,DateService) {
    // Get last connection data statistics from the server
    $http.get(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/stats/app',{headers: {'token': localStorage.getItem('token_admin')}}).then(successCallbackStats, errorCallbackStats);
    function successCallbackStats(stats){
        var accessData= stats.data.lastAccess;
        var label=[];
        var data=[];
        var date_now=new Date();
        // // Fill last twelve dates with Access Statistics
        var lastTwelve = DateService.getArrayLastTwelve(date_now);
        for( var key in accessData) {
            var year = key;
            // Search last 12 months
            if (year == lastTwelve[0][1] || year == lastTwelve[11][1]) {
                var accessDataYear=accessData[key];
                for (var i = 0; i < accessDataYear.length; i++) {
                    var month= accessDataYear[i].month-1;
                    for (var j = 0; j < lastTwelve.length; j++) {
                        if (month == lastTwelve[j][0]) {
                            lastTwelve[j][2]=accessDataYear[i].data;
                        }
                    }
                }
            }
        }
        // Fill chart data with the last 12 month
        for (var i = 0; i < lastTwelve.length; i++) {
            var month= DateService.getMonthName(lastTwelve[i][0]);
            var date = month+", "+lastTwelve[i][1];
            label.push(date);
            data.push(lastTwelve[i][2]);
        }
        $scope.labels = label;
        $scope.data = data;
        $scope.options = {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    }
    function errorCallbackStats(error){
        console.log("Error getting stats");
        if (error.status == "403") {
			localStorage.removeItem('token_admin');
			$location.path('/admin');
		}
		else {
			var error_msg = "Error " + error.status + ": " + error.data;
			alert(error_msg);
		}
    }
});

// Statistics Data Binding
app_admin.controller('StatisticsController', function($scope,$http,$location,DateService) {
    $http.get(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/stats/app',{headers: {'token': localStorage.getItem('token_admin')}}).then(successCallbackStats, errorCallbackStats);

    function successCallbackStats(stats){
        // Map Information Bind
		var location= stats.data.resources.byCountry;
		 var locationArr = eval( location );
		 var mapData = [];
		 for ( var i = 0; i < locationArr.length; i++ ) {
		 mapData.push([locationArr[i].country,locationArr[i].count])
		 };
		 // Show Data on the map
		 new Chartkick.GeoChart("map",mapData ,{adapter: "google"});

        // Tweets/Day Data Bind
        var label=[];
        var data=[];
        var tweets = stats.data.resources.byDay;
        for ( var i = 0; i < tweets.length; i++ ) {
            var date = tweets[i].day+" "+DateService.getMonthName(tweets[i].month-1);
            label.push(date);
            data.push(tweets[i].count);
        };
        $scope.labels = label;
        $scope.data = data;
        $scope.colors = ['#45b7cd'];
        $scope.options = {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        };
        // Top Tweets/User Data Bind
        label=[];
        data=[];
        var users = stats.data.resources.byUser;
        for ( var i = 0; i < users.length; i++ ) {
            label.push(users[i].userId);
            data.push(users[i].count);
        };
        $scope.labels2 = label;
        $scope.data2 = data;
        $scope.options2 = {
            scales: {
                xAxes: [{
                    display: this.scalesdisplay,
                    ticks: {
                        beginAtZero:this.beginzero,
                    }
                }],
                yAxes: [{
                    display: this.scalesdisplay,
                    ticks: {
                        beginAtZero:this.beginzero,
                    }
                }]
            }
        };
    }
    function errorCallbackStats(error){
        console.log("Error getting stats");
        if (error.status == "403") {
			localStorage.removeItem('token_admin');
			$location.path('/admin');
		}
		else {
			var error_msg = "Error " + error.status + ": " + error.data;
			alert(error_msg);
		}
    }
    $scope.onClick = function (points, evt) {
        $http.get(localStorage.getItem('api')+":"+localStorage.getItem('port')+'/users/'+points[0]._view.label,{headers: {'token': localStorage.getItem('token_admin')}}).then(successCallbackInfo, errorCallbackInfo);
        function successCallbackInfo(info){
			console.log(points[0]);
            $scope.user_id=points[0]._view.label;
            $scope.info="Email: " + info.data[0].email + "\n" +
                "Name: " + info.data[0].name + "\n" +
                "Surname: "+ info.data[0].surname + "\n" +
                "Register: "+ formatDate(new Date(info.data[0].registrationDate)) + "\n" +
                "Last connection: " + formatDate(new Date(info.data[0].lastAccess)) + "\n";
        }
        function errorCallbackInfo(error){
            $scope.info="Error getting data";
            console.log("Error getting info user");
        }
    };
});

/**
 * Controller to show or hide top admin dropdown menu and logout
 */
app_admin.controller('adminMenuCtrl', function ($scope,$location) {
    $scope.isAdminActive = function () {
        // if admin active
        if(localStorage.getItem('token_admin')){

            return true;

        }
        //if not
        else{

            return false;
        }
    };
    $scope.logout =function() {
        localStorage.clear();
        $location.path('/admin');
    };
});

// Return a format date for the user
function formatDate(date) {
    if (date==null) {
        return "";
    }
    else  {
        var monthNames = [
                "January", "February", "March",
                "April", "May", "June", "July",
                "August", "September", "October",
                "November", "December"
        ];
        var day = date.getDate();
        var monthIndex = date.getMonth();
        var year = date.getFullYear();
        var hour = date.getHours();
        if (hour<10) {
            hour="0"+hour;
        }
        var minutes = date.getMinutes();
        if (minutes<10) {
            minutes="0"+minutes;
        }
        return day + '-' + monthNames[monthIndex] + '-' + year + '  ' + hour + ':' + minutes;
    }
}
