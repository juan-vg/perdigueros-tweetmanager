// Password Data and Check 
angular.module('PwdCheck', []).controller('PasswordController', function ($scope,$window) {
    $scope.pwdError =false;
    $scope.checkPwd =function() {
      if ($scope.password !== "12345678") {
        $scope.pwdError =true;
      }
      else {
        var dir = window.location.pathname;
        $window.location.href = dir.substring(0,dir.lastIndexOf('/'))+'/admin-main-panel.html';
      }
    };
  });

// List of Users Data
var UsersData=angular.module('UsersData', []);
UsersData.controller('UserController', function($scope) {
	$scope.users =[
  					{
    					"name" : "alex",
    					"last" : "29/08/2016",
    					"first" : "29/04/2016"
  					},
    				{
    					"name" : "albert",
    					"last" : "29/08/2016",
    					"first" : "29/04/2016"
  					},
  					{
    					"name" : "andrea",
    					"last" : "29/08/2016",
    					"first" : "29/04/2016"
  					},
				];
  // RemoveUser from the list
	$scope.removeUser =function(name) {
		var index = -1;		
		var comArr = eval( $scope.users );
		for( var i = 0; i < comArr.length; i++ ) {
			if( comArr[i].name === name ) {
				index = i;
				break;
			}
		}
		$scope.users.splice( index, 1 );
	};

});

// User Iputs and Outputs from the Application Data
UsersData.controller('UserDoorController', function($scope) {
	$scope.users =[
  					{
    					"name" : "alex",
    					"type" : "Salida",
    					"date" : "05/01/1998 01:00"
  					},
    				{
    					"name" : "albert",
    					"type" : "Nuevo",
    					"date" : "15/07/1999 15:00"
  					},
				];

});

// User Last Connection Time Data
UsersData.controller('UserLastController', function($scope) {
	$scope.users =[
  					{
    					"name" : "alex",
    					"date" : "05/01/1998 01:00"
  					},
    				{
    					"name" : "albert",
    					"date" : "15/07/1999 15:00"
  					},
				];
});

// Accounts and Hastags Data Binding
var ListAccounts=angular.module('ListAccounts', []);
ListAccounts.controller('AccountController', function($scope) {
  $scope.accounts =[
            {
              "account" : "@alex",
              "user_account" : "alex",
              "hashtags" : ["#sports"]
            },
            {
              "account" : "@albert",
              "user_account" : "albert",
              "hashtags" : ["#music","#sports","#videogames"]
            },
        ];

  $scope.showHashtags =function(account) {
    $scope.user_select=account.account;
    var index = -1;   
    var comArr = eval( account.hashtags );
    var result='';
    for( var i = 0; i < comArr.length; i++ ) {
      result=result+comArr[i]+'\n';
    }
    $scope.hashtags_select=result;
  };
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