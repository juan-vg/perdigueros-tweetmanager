// Password Data and Check 
angular.module('PwdCheck', ['ngStorage']).controller('PasswordController', function ($scope,$http,$window,$location,$localStorage) {
    $scope.pwdError =false;
    $scope.checkPwd =function() {
		var data = {
			'email': 'admin@admin.com',
			'passwd': $scope.password
			};
		$http.post('http://zaratech-ptm.ddns.net:8888/login/signin',data).then(successCallback, errorCallback);
      	function successCallback(response){
			var dir = window.location.pathname;
			$localStorage.token = response.data.token;
			$window.location.href = dir.substring(0,dir.lastIndexOf('/'))+'/admin-main-panel.html';
		}
		function errorCallback(error){
			$scope.pwdError = true;
			console.log("Error authentication");
		}
    };
  });

// List of Users Data
var UsersData=angular.module('UsersData', ['ngStorage']);
UsersData.controller('UserController', function($scope,$http,$localStorage) {
	$http.get('http://zaratech-ptm.ddns.net:8888/users',{headers: {'token': $localStorage.token}}).then(successCallback, errorCallback);
	function successCallback(response){
		//Get response data
		var users=response.data;
		// Return a format date for the user
		function formatDate(date) {
			var monthNames = [
				"Enero", "Febrero", "Marzo",
				"Abril", "Mayo", "Junio", "Julio",
				"Agosto", "Septiembre", "Octubre",
				"Noviembre", "Diciembre"
			];
			var day = date.getDate();
			var monthIndex = date.getMonth();
			var year = date.getFullYear();
			var hour = date.getHours();
			var minutes = date.getMinutes();
			return day + '-' + monthNames[monthIndex] + '-' + year + '  ' + hour + ':' + minutes;
		}
		var usersArr = eval( users );
		var data = [];
		for ( var i = 0; i < usersArr.length; i++ ) {
			var user= {
				"_id": usersArr[i]._id,
				"email": usersArr[i].email,
				"registrationDate" : formatDate(new Date(usersArr[i].registrationDate))
			};
			data.push(user);
		}
		// Bind User data
		$scope.users=data;
		
		// RemoveUser from the list
		$scope.removeUser =function(user) {
			$http.delete('http://zaratech-ptm.ddns.net:8888/users/'+user._id,{headers: {'token': $localStorage.token}}).then(successCallback, errorCallback);
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
				$scope.pwdError = true;
				console.log("Error Removing Account");
			}
		}
	}
	function errorCallback(error){
		console.log("Error getting Users list");
	}
});

// User Iputs and Outputs from the Application Data
UsersData.controller('UserDoorController', function($scope) {
	$scope.users =[
  					{
    					"email" : "alex",
    					"type" : "Salida",
    					"date" : "05/01/1998 01:00"
  					},
    				{
    					"email" : "albert",
    					"type" : "Nuevo",
    					"date" : "15/07/1999 15:00"
  					},
				];

});

// User Last Connection Time Data
UsersData.controller('UserLastController', function($scope) {
	$scope.users =[
  					{
    					"email" : "alex",
    					"date" : "05/01/1998 01:00"
  					},
    				{
    					"email" : "albert",
    					"date" : "15/07/1999 15:00"
  					},
				];
});

// Accounts and Hastags Data Binding
var ListAccounts=angular.module('ListAccounts', ['ngStorage']);
ListAccounts.controller('AccountController', function($scope,$http,$localStorage) {
	// Get accounts data 
	$http.get('http://zaratech-ptm.ddns.net:8888/twitter-accounts',{headers: {'usertoken': $localStorage.token}}).then(successCallback, errorCallback);
	
	//Data Get Successfull
	function successCallback(response){
		$scope.accounts = response.data;
		// Show information of an account
		$scope.showInfo =function(account) {
			$scope.user_select=account.email;
			$scope.account_select=account.name;
			$scope.account_description=account.description;
			// Get Hashtag Data from the account
			$http.get('http://zaratech-ptm.ddns.net:8888/twitter-accounts/'+account._id+'/hashtags',{headers: {'token': $localStorage.token}}).then(successCallbackHastags, errorCallbackHastags);
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
			}
		};
		
		// RemoveUser from the list
		$scope.removeAccount =function(account) {
			$http.delete('http://zaratech-ptm.ddns.net:8888/twitter-accounts/'+account._id,{headers: {'usertoken': $localStorage.token}}).then(successCallback, errorCallback);
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
				$scope.pwdError = true;
				console.log("Error Removing Account");
			}
		};
	}
	function errorCallback(error){
		$scope.pwdError = true;
		console.log("Error getting user accounts");
	}
});

// Stadistics Data Binding
var StadisticsData =angular.module('StadisticsData', ['chart.js']);
StadisticsData.controller('StadisticsController', function($scope) {
  // Map Information Bind
  $scope.location=[
            {
              "country" : "Spain",
              "number" : 613
            },
            {
              "country" : "United States",
              "number" : 111
            },
            {
              "country" : "Germany",
              "number" : 453
            },
            {
              "country" : "Brazil",
              "number" : 1233
            }
    ];
    var locationArr = eval( $scope.location );
    var mapData = [];
    for ( var i = 0; i < locationArr.length; i++ ) {
      mapData.push([locationArr[i].country,locationArr[i].number])
    };
  // Show Data on the map
  new Chartkick.GeoChart("map",mapData ,{adapter: "google"});

  // Tweets/Day Data Bind
  $scope.tweets =[
            {
              "day" : "05/10/2017",
              "number" : 201
            },
            {
              "day" : "05/11/2017",
              "number" : 178
            },
            {
              "day" : "05/12/2017",
              "number" : 122
            },
            {
              "day" : "05/13/2017",
              "number" : 120
            },
            {
              "day" : "05/14/2017",
              "number" : 145
            }
        ];

  var tweetsArr = eval( $scope.tweets );
  var label=[];
  var data=[];
  for ( var i = 0; i < tweetsArr.length; i++ ) {
    label.push(tweetsArr[i].day);
    data.push(tweetsArr[i].number);
  };
  $scope.labels = label;
  $scope.data = data;
  $scope.colors = ['#45b7cd'];
  $scope.options = {
    scales: {
      xAxes: [{
        type: "time",
        time: {
          unit: 'day',
          round: 'day',
          displayFormats: {
            day: 'MMM D'
          }
        }
      }],
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  }

  // Top Tweets/User Data Bind
  $scope.users =[
            {
              "name" : "alex",
              "number" : 11
            },
            {
              "name" : "albert",
              "number" : 21
            },
            {
              "name" : "manuel",
              "number" : 5
            }
        ];
  var usersArr = eval( $scope.users );
  var label2=[];
  var data2=[];
  for ( var i = 0; i < usersArr.length; i++ ) {
    label2.push(usersArr[i].name);
    data2.push(usersArr[i].number);
  };
  $scope.labels2 = label2;
  $scope.data2 = data2;
  $scope.options2 = {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };
});